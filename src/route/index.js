// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Track {
  static #list = []

  constructor(name, author, image) {
    this.id = Math.floor(1000 + Math.random() * 9000)
    this.name = name
    this.author = author
    this.image = image
  }

  static create(name, author, image) {
    const newTrack = new Track(name, author, image)
    this.#list.push(newTrack)
    return newTrack
  }

  static getList() {
    return this.#list.reverse()
  }

  static getById(id) {
    return this.#list.find((track) => track.id === id)
  }
}

Track.create(
  'in yan',
  'monatic',
  'https://picsum.photos/100/100',
)

Track.create(
  'bella conmigo',
  'selena gomez',
  'https://picsum.photos/100/100',
)

Track.create(
  'shameless',
  'Camila',
  'https://picsum.photos/100/100',
)
Track.create(
  'in yan',
  'monatic',
  'https://picsum.photos/100/100',
)

Track.create(
  'bella conmigo',
  'selena gomez',
  'https://picsum.photos/100/100',
)

Track.create(
  'shameless',
  'Camila',
  'https://picsum.photos/100/100',
)

class Playlist {
  static #list = []

  constructor(name) {
    this.id = Math.floor(1000 + Math.random() * 9000)
    this.name = name
    this.tracks = []
    this.image = 'https://picsum.photos/100/100'
  }

  static create(name) {
    const newPlaylist = new Playlist(name)
    this.#list.push(newPlaylist)
    return newPlaylist
  }

  static getList() {
    return this.#list.reverse()
  }

  static makeMix(playlist) {
    const allTracks = Track.getList()

    let randomTracks = allTracks
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)

    playlist.tracks.push(...randomTracks)
  }

  static getById(id) {
    return (
      Playlist.#list.find(
        (playlist) => playlist.id === id,
      ) || null
    )
  }

  deleteTrackById(trackId) {
    this.tracks = this.tracks.filter(
      (track) => track.id !== trackId,
    )
  }

  addTrackById(trackId) {
    this.tracks.push(Track.getById(trackId))
  }

  static findListByValue(value) {
    return this.#list.filter((playlist) =>
      playlist.name
        .toLowerCase()
        .includes(value.toLowerCase()),
    )
  }
}
//==================================================

router.get('/spotify-choose', (req, res) => {
  res.render('spotify-choose', {
    style: 'spotify-choose',

    data: {},
  })
})

router.get('/spotify-create', (req, res) => {
  const isMix = !!req.query.isMix

  res.render('spotify-create', {
    style: 'spotify-create',

    data: {
      isMix,
    },
  })
})

router.post('/spotify-create', (req, res) => {
  const isMix = !!req.query.isMix

  const name = req.body.name

  if (!name) {
    res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Введіть назву плейліста',
        link: isMix
          ? '/spotify-create?isMix=true'
          : '/spotify-create',
      },
    })
  }

  const playlist = Playlist.create(name)

  if (isMix) {
    Playlist.makeMix(playlist)
  }

  console.log(playlist)

  res.render('alert', {
    style: 'alert',

    data: {
      message: 'Успішно',
      info: 'Плейліст створений',
      link: `/spotify-playlist?id=${playlist.id}`,
    },
  })
})

router.get('/spotify-playlist', (req, res) => {
  const id = Number(req.query.id)

  const playlist = Playlist.getById(id)

  if (!playlist) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: '/spotify-choose',
      },
    })
  }

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

router.get('/spotify-track-delete', (req, res) => {
  const playlistId = Number(req.query.playlistId)
  const trackId = Number(req.query.trackId)

  const playlist = Playlist.getById(playlistId)

  if (!playlist) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: `/spotify-playlist?id=${playlistId}`,
      },
    })
  }

  playlist.deleteTrackById(trackId)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

router.get('/spotify-search', (req, res) => {
  const value = ''

  const list = Playlist.findListByValue(value)

  res.render('spotify-search', {
    style: 'spotify-search',

    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})

router.post('/spotify-search', (req, res) => {
  const value = req.body.value || ''

  const list = Playlist.findListByValue(value)

  res.render('spotify-search', {
    style: 'spotify-search',

    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})

router.get('/spotify-library', (req, res) => {
  res.render('spotify-library', {
    style: 'spotify-library',
    data: {
      list: Playlist.getList().map(
        ({ tracks, ...rest }) => ({
          ...rest,
          amount: tracks.length,
        }),
      ),
    },
  })
})

router.get('/spotify-add-song', (req, res) => {
  const id = Number(req.query.playlistId)

  console.log(id)

  res.render('spotify-track-add', {
    style: 'spotify-track-add',

    data: {
      playlistId: id,
      tracks: Track.getList(),
    },
  })
})

router.get('/spotify-track-add', (req, res) => {
  const id = Number(req.query.playlistId)
  console.log(id)

  const trackId = Number(req.query.trackId)
  console.log(trackId)

  const playlist = Playlist.getById(id)

  if (!playlist) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: '/spotify-library',
      },
    })
  }

  playlist.addTrackById(trackId)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})
// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
