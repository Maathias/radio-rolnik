const dotenv = require('dotenv').config(),
  express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
  pretty = require('pretty-log'),
  io = require('socket.io'),
  SpotifyWebApi = require('spotify-web-api-node'),
  db = require('./db');

class Track {
  constructor(data, source) {
    this.source = source
    switch (source) {
      case 'spotify': this._spotify(data); break;
      case 'db': this._db(data); break;
    }

    this._listen()

    this.votes = null
    this.placement = null
    this.flag = null
  }

  _db(data) {
    this.source = data.source
    this.album = data.album
    this.artists = data.artists
    this.id = data.id
    this.duration = data.duration
    this.title = data.title
    this.banned = data.banned
    this.explicit = data.explicit
  }

  _spotify(data) {
    this.album = {
      name: data.album.name,
      image: data.album.images[0]
    }

    this.artists = []
    for (let artist of data.artists) {
      this.artists.push(artist.name)
    }

    this.id = data.id
    this.duration = data.duration_ms
    this.title = data.name
    this.explicit = data.explicit
    this.banned = false
  }

  _listen() {
    switch (this.source) {
      case 'spotify':
        this.listen = `https://open.spotify.com/track/${this.id}`
        break;
    }
  }
}

class User {
  constructor(user) {
    this.id = user.id
    this.name = user.name
    this.mail = user.mail
    this.token = user.token
    this.admin = user.admin
  }

  info() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      token: this.token,
      admin: this.admin
    }
  }
}

function apiSearch(id) {
  return new Promise((resolve, reject) => {
    if (typeof id != 'string') return reject(new Error('Incorrect id, must by type String'))
    spotifySearch.getTrack(id).then(data => {
      resolve(data.body)
    }).catch(err => {
      reject(err)
    })
  })

}

function tokenWrite(content, path) {
  fs.writeFile(path, JSON.stringify(content, null, 4), function (err) {
    if (err) throw err
  })
}

function getAccess() {
  spotifySearch.clientCredentialsGrant().then(function (data) {
    pretty.log({ data: `Spotify: (search) new Access`, action: 'info' })

    credentials.spotify.Access = {
      value: data.body['access_token'],
      expires: new Date().getTime() + (data.body['expires_in'] * 1e3)
    }

    tokenWrite(credentials.spotify, './spotify-cred.json')

    spotifySearch.setAccessToken(credentials.spotify.Access.value)

    setTimeout(function () {
      getAccess()
    }, data.body['expires_in'] * 1e3)

  }
  ).catch(err => {
    console.error(err)
  })

}

function refreshAccess() {
  spotifyPlayer.refreshAccessToken().then(function (data) {
    pretty.log({ data: `Spotify: (player) new Access`, action: 'info' })
    spotifyPlayer.setAccessToken(data.body['access_token']);
    credentials.player.Access = {
      value: data.body['access_token'],
      expires: new Date().getTime() + (data.body['expires_in'] * 1e3)
    }
    tokenWrite(credentials.player, './player-cred.json')
  }
  ).catch(err => {
    console.error(err)
  })
}

const credentials = {
  spotify: require('./spotify-cred.json'),
  player: require('./player-cred.json'),
  api: require('./api-cred.json')
}

const Previous = {
  tracks: [],
  new(tid, played) {
    if (this.tracks[this.tracks.length - 1]) if (this.tracks[this.tracks.length - 1].tid == tid) {
      return
    }

    db.history.add(tid)

    var previous = this._create(tid, played)
    this.tracks.push(previous)
    this._send(previous)
  },
  _create(tid, played = new Date) {
    return { tid: tid, played: played.getTime() }
  },
  _send(previous) {
    server.emit('previous', {
      new: previous,
    })
  },
  async update() {
    this.tracks = []
    for (previous of await db.history.get()) {
      var previous = this._create(previous.tid, previous.createdAt)
      this.tracks.unshift(previous)
      this._send(previous)
    }
    return this.tracks
  },
  get() {
    return {
      all: this.tracks.slice(0, 20)
    }
  }
},
  Player = {
    current: {},
    status: 'paused',
    set(track, status = this.status) {
      this.current = track
      this.status = status
      Previous.new(this.current.id)
      pretty.log(`Player: new track - ${this.current.title}`, 2)
      server.emit('player', {
        tid: this.current.id,
        status: this.status
      })
    },
    update(status) {
      if (this.status === status) return
      this.status = status
      pretty.log(`Player: status update: ${status}`, 2)
      server.emit('player', {
        status: this.status
      })
    },
  },
  Tracks = {
    _list: {},
    get(id) {
      return new Promise((resolve, reject) => {
        if (!this._list[id]) { // check for track in cache
          db.tracks.get(id).then(tdata => { // track not in cache, query db
            this.set(tdata, 'db')
            resolve(this._list[id])
          }).catch(err => { // track not in db, query api
            apiSearch(id).then(tdata => {
              this.set(tdata, 'spotify')
              db.tracks.add(this._list[id]) // add to db
              resolve(this._list[id])
            }).catch(err => { // not in api, reject
              reject(err)
              pretty.log({ data: err.message, action: 'error' })
            })
          })
        } else {
          resolve(this._list[id])
        }
      })
    },
    set(tdata, source) {
      this._list[tdata.id] = new Track(tdata, source)
      return tdata.id
    }
  },
  Chart = {
    tids: [],
    values: {},
    _serial: 0,
    _sentAt: null,
    get serial() { return this._serial },
    set serial(value) {
      this._serial = value
      this._changed = true
      if (this._serial - this._sentAt > this.threshold) { // force update after 'thershold' of votes
        this.update()
      }
    },
    _changed: true,
    delay: process.env.chart_delay,
    threshold: process.env.chart_threshold,
    interval() {
      if (this._changed) {
        this.update()
      }
      setTimeout(function () { Chart.interval() }, this.delay)
    },
    async update() {
      this.values = await db.votes.validAll()
      this.tids = []

      for (let tid in this.values) {
        this.tids.push(tid)
      }

      this.tids.sort((a, b) => {
        return this.values[b].total - this.values[a].total
      })

      for (let tid in this.values) {
        let track = await Tracks.get(tid)
        track.votes = this.values[tid]
        track.placement = this.tids.indexOf(tid) + 1
        if (track.banned) this.tids.splice(this.tids.indexOf(tid), 1)
      }
      this._changed = false
      this._sentAt = this._serial
      server.emit('chart', this.get())
    },
    get() {
      return {
        tids: this.tids,
        values: this.values,
        serial: this.serial
      }
    },
  },
  Stats = {
    _online: 0,
    _auth: 0,
    _authed: {},
    get(id) {
      return {
        'online': this._online,
        'auth': this._auth
      }[id]
    },
    online() {
      return this._online
    },
    connect() {
      this._online++
    },
    disconnect() {
      this._online--
    },
    auth(socket) {
      if (!this._authed[socket.user.id]) this._authed[socket.user.id] = {}
      this._authed[socket.user.id][socket.id] = {
        user: socket.user,
        socket: socket
      }
      this._auth++
    },
    deauth(socket) {
      if (!socket.user) return
      delete this._authed[socket.user.id][socket.id]
      this._auth--
    }
  },
  Playback = {
    current: {},
    _poll: process.env.playback_poll,
    _timings: (function (timings) {
      let out = []
      for (let p of timings) {
        out.push([(p[0][0] * 60) + p[0][1], (p[1][0] * 60) + p[1][1]])
      }
      return out
    })(require('./timings.json')),
    interval() {
      if(this._poll) this.update()
      clearTimeout(this._timeout)
      this._timeout = setTimeout(function () { Playback.interval() }, this.getDelay() * 1e3)
    },
    update() {
      spotifyPlayer.getMyCurrentPlaybackState().then(data => {
        Playback.current = data.body
        Playback.checkTrack()
      }).catch(err => {
        console.error(err)
      })
    },
    checkTrack() {
      if (this.current.is_playing === undefined) return Player.update('stopped')
      if (this.current.item.id != Player.current.id) {
        if (this.current.is_playing) Tracks.get(this.current.item.id).then(track => {
          Player.set(track, 'playing')
        })
        else this.checkPlaying()
      } else this.checkPlaying()
    },
    checkPlaying() {
      if (this.current.is_playing ^ Player.status == 'playing') {
        Player.update(this.current.is_playing ? 'playing' : 'paused')
      }
    },
    getDelay() {
      let date = new Date(),
        minutes = date.getMinutes() + (date.getHours() * 60),
        delay, last

      for (let i in this._timings) {
        let [start, end] = this._timings[i]

        if (start - minutes <= 0 && end - minutes >= 0) {
          delay = 0
          break
        } else {
          if (last < 0 && start - minutes > 0) {
            delay = start - minutes
            break
          }
          delay = start - minutes
          last = end - minutes
        }
      }
      if (delay < 0) {
        delay = 1440 - minutes
      }

      if (last <= 1 && last >= 0) return 5
      if (delay <= 1) return 5
      else return (delay - 1) * 60
    }
  }

var spotifySearch = new SpotifyWebApi({
  clientId: credentials.spotify.clientId,
  clientSecret: credentials.spotify.clientSecret
}),
  spotifyPlayer = new SpotifyWebApi({
    clientId: credentials.spotify.clientId,
    clientSecret: credentials.spotify.clientSecret,
    refreshToken: credentials.player.Refresh.value,
    redirectUri: 'https://radio-rolnik.mtps.pl/spotify/done'
  })

// search token
if (new Date().getTime() >= credentials.spotify.Access.expires) {
  pretty.log({ data: `Spotify: (search) last Access is expired`, action: 'info' })
  getAccess(spotifySearch)
} else {
  spotifySearch.setAccessToken(credentials.spotify.Access.value)
  setTimeout(function () {
    pretty.log({ data: `Spotify: (search) current token expired`, action: 'info' })
    getAccess(spotifySearch)
  }, (credentials.spotify.Access.expires - new Date().getTime()))
}

// player token
if (new Date().getTime() >= credentials.player.Access.expires) {
  pretty.log({ data: `Spotify: (player) last Access is expired`, action: 'info' })
  refreshAccess()
} else {
  spotifyPlayer.setAccessToken(credentials.player.Access.value)
  setTimeout(function () {
    pretty.log({ data: `Spotify: (player) current token expired`, action: 'info' })
    refreshAccess()
  }, (credentials.player.Access.expires - new Date().getTime()))
}

var app = express(),
  www = http.createServer(app),
  server = io(www);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.port);

www.listen(process.env.port);

www.on('error', function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  pretty.log({
    data: `Error: port ${process.env.port}: ${error.code}`,
    action: 'error'
  })
});

www.on('listening', function () {
  pretty.log(`www: listening on ${process.env.port}`)
});

app.use('/api/*', (req, res, next) => {
  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password && login === credentials.api.user && password === credentials.api.password) {
    return next()
  }

  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message
})

app.get('/api/player/set', function (req, res) {
  if (req.query.tid) {
    Tracks.get(req.query.tid).then(track => {
      Player.set(track)
      res.send('ok')
      res.status(200)
    }).catch(err => {
      res.send(err.message)
      res.status(400)
    })
  }
})

app.get('/api/player/status', function (req, res) {
  let states = ['playing', 'paused', 'stopped']
  if (states.includes(req.query.set)) {
    Player.update(req.query.set)
    res.send('ok')
    res.status(200)
  } else {
    res.send('Incorrect status')
    res.status(400)
  }
})

app.get('/api/spotify/login', function (req, res) {
  var scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-read-currently-playing'],
    redirect = spotifyPlayer.createAuthorizeURL(scopes, 'what')

  res.end(redirect)
})

app.get('/spotify/done', function (req, res) {
  res.end('<script>window.onload=function(){window.exit(location)}</script>')
})

Previous.update().then(tracks => {
  Playback.interval()
})
Chart.interval()

server.on('connection', socket => {

  Stats.connect()
  pretty.log(`Socket: '${socket.id}' '${socket.handshake.headers["x-real-ip"]}' connected`, 3);

  socket.on('disconnect', function () {
    Stats.disconnect()
    if (socket.user) Stats.deauth(socket)
    pretty.log(`Socket: '${socket.id}' disconnected`, 3)
  })

  socket.on('player', function () {
    socket.emit('player', {
      tid: Player.current.id,
      status: Player.status
    })
  })

  socket.on('previous', function () {
    socket.emit('previous', Previous.get())
  })

  socket.on('clear', function (data) {
    Stats.deauth(socket)
    socket.user = undefined
  })

  socket.on('auth', function (tokens) {
    if (typeof tokens != 'object') return // validate input

    if (tokens.local) {
      if (typeof tokens.local != 'string') return // validate token
      db.users.login(tokens.local).then(udata => { // get user from db
        socket.user = new User(udata)
        socket.emit('auth', socket.user.info())
        pretty.log(`Socket: '${socket.id}' auth by token.local as '${socket.user.name}'`, 3)
        Stats.auth(socket)
      }).catch(err => { // invalid token.local
        socket.user = undefined
        socket.emit('auth', { // demand token clear
          clear: true
        })
        pretty.log(`Socket: '${socket.id}' auth by token.local failed`, 3)
      })
    } else if (tokens.fb) {
      if (typeof tokens.fb != 'string') return // validate token

      https.get(`https://graph.facebook.com/v8.0/me?fields=id,name,email&access_token=${tokens.fb}`, (resp) => {
        let data = ''
        resp.on('data', (chunk) => data += chunk)

        resp.on('end', () => {
          let creds = JSON.parse(data)
          if (creds.error) {
            socket.emit('meta', {
              type: 'error',
              action: 'auth',
              message: `Auth: there was and error with your facebook token: ${creds.error}`
            })
            return pretty.log({ data: creds.error.message, action: 'error' })
          }

          db.users.get(creds.id).then(user => { // user found in db
            return user
          }).catch(async err => { // not in db, add user
            pretty.log(`Auth: adding new user '${creds.name}'`, 3)
            return await db.users.add(creds)
          }).then(user => { // finalize auth
            socket.user = new User(user)
            socket.emit('auth', socket.user.info())
            pretty.log(`Socket: '${socket.id}' auth by token.fb as '${socket.user.name}'`, 3)
            Stats.auth(socket)
          })
        });

      }).on("error", (err) => {
        socket.emit('meta', {
          type: 'error',
          action: 'auth',
          message: `Auth: there was and error while fetching facebook data: ${err.message}`
        })
        throw err
      })
    }
  })

  socket.on('search', function (data) {
    if (typeof data != 'object') return // validate input
    if (typeof data.query != 'string') return
    if (typeof data.source != 'string') return

    if (data.source == 'spotify') {
      spotifySearch.searchTracks(data.query)
        .then(response => {
          socket.emit('results', {
            tids: response.body.tracks.items.map(tdata => tdata.id),
            total: response.body.tracks.total
          })
        }).catch(err => {
          socket.emit('meta', {
            type: 'error',
            action: 'search',
            message: `'${data.query}' not found: ${err.message}`
          })
          pretty.log({ data: err.message, action: 'error' });
        })
    }
  });

  socket.on('track', function (data) {
    Tracks.get(data.tid).then(track => {
      socket.emit('track', track)
    }).catch(err => {
      socket.emit('meta', {
        type: 'error',
        action: 'track',
        message: `tid '${data.tid}' not found: ${err.message}`
      })
    })
  })

  socket.on('flags', function (tid) {
    if (!socket.user) return
    db.votes.validUser(socket.user, tid).then(vote => {
      socket.emit('flags', {
        tid: tid,
        flags: vote !== null ? vote.flag : null
      })
    }).catch(err => {
      socket.emit('meta', {
        type: 'error',
        action: 'flags',
        message: `Flags: api error '${err.message}'`
      })
    })
  })

  socket.on('vote', function (data) {
    db.votes.add(socket.user, data.tid, data.flag).then(vote => {
      Chart.serial++
    }).catch(err => {
      socket.emit('meta', {
        type: 'error',
        action: 'vote',
        message: `Vote: ignored: ${err.message}`
      })
    })
  })

  socket.on('chart', function (data) {
    socket.emit('chart', Chart.get())
  })

  socket.on('admin', function (data) {
    if ((socket.user.admin <= 0)) return
    switch (data.action) {
      case 'search':
        if (data.search.tags.includes('track')) {
          db.tracks.search(data.search.query).then(tracks => {
            socket.emit('admin', {
              search: {
                tracks: tracks
              }
            })
          })
        }
        if (data.search.tags.includes('user')) {
          db.users.search(data.search.query).then(users => {
            socket.emit('admin', {
              search: {
                users: users
              }
            })
          })
        }
        break;
      case 'track':
        db.tracks.get(data.track.id).then(tdata => {
          socket.emit('admin', {
            track: {
              tdata: tdata
            }
          })
        })
        break;
      case 'user':
        db.users.get(data.user.id).then(udata => {
          socket.emit('admin', {
            user: {
              udata: udata
            }
          })
        })
        break;
      case 'vote':
        db.votes.get(data.vote.uid, data.vote.tid).then(votes => {
          socket.emit('admin', {
            vote: {
              votes: votes
            }
          })
        })
        break;
      case 'spotify':
        if (data.spotify.code) {
          spotifyPlayer.authorizationCodeGrant(data.spotify.code).then(
            function (data) {
              pretty.log({ data: `Spotify: (player) log in`, action: 'info' })

              credentials.player.Access.value = data.body['access_token']
              credentials.player.Access.expires = new Date().getTime() + (data.body['expires_in'] * 1e3)
              credentials.player.Refresh.value = data.body['refresh_token']
              tokenWrite(credentials.player, './player-cred.json')
              spotifyPlayer.setAccessToken(data.body['access_token']);
              spotifyPlayer.setRefreshToken(data.body['refresh_token']);
            },
            function (err) {
              console.log('Something went wrong!', err);
            }
          );
        }
        if (data.spotify.playing) {
          spotifyPlayer.getMyCurrentPlaybackState().then(data => {
            console.log(data)
          }).catch(err => {
            console.error(err)
          })
        }
        break;
    }

  })

});