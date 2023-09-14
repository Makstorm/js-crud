// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class User {
  static #list = []

  constructor(email, login, password) {
    this.email = email
    this.login = login
    this.password = password
    this.id = new Date().getTime()
  }

  static add = (user) => {
    this.#list.push(user)
  }

  static getList = () => {
    return this.#list
  }

  static getById = (id) => {
    return this.#list.find((user) => user.id === id)
  }

  static deleteById = (id) => {
    const index = this.#list.findIndex(
      (user) => user.id === id,
    )

    if (index !== -1) {
      this.#list.splice(index, 1)
    }
  }

  static editById = (id, { email, login, password }) => {
    const user = this.getById(Number(id))

    if (user) {
      if (user.password !== password) {
        return null
      }

      if (email) {
        user.email = email
      }

      if (login) {
        user.login = login
      }

      return user
    }

    return null
  }
}

class Product {
  static #list = []

  constructor(name, price, description) {
    this.name = name
    this.price = price
    this.description = description
    this.id = Math.floor(Math.random() * 100000)
    this.createdDate = new Date().toISOString()
  }

  static getList() {
    return this.#list
  }

  static add(product) {
    this.#list.push(product)
  }

  static getById(id) {
    return this.#list.find((product) => product.id === id)
  }

  static deleteById(id) {
    const index = this.#list.findIndex(
      (product) => product.id === id,
    )

    if (index !== -1) {
      this.#list.splice(index, 1)
    }
  }

  static updateById(id, data) {
    const { name, price, description } = data

    const product = this.getById(id)

    if (product) {
      if (name) {
        product.name = name
      }

      if (description) {
        product.description = description
      }

      if (price) {
        product.price = price
      }
    }
  }
}

// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки
router.get('/', function (req, res) {
  // res.render генерує нам HTML сторінку

  const list = User.getList()

  console.log(list)
  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('index', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'index',

    data: {
      users: {
        list,
        isEmpty: list.length === 0,
      },
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

router.post('/user-create', function (req, res) {
  const { email, login, password } = req.body

  const user = new User(email, login, password)

  User.add(user)

  console.log(User.getList())

  res.render('success-info', {
    style: 'success-info',
    info: 'Користувач створений',
  })
})

router.get('/user-delete', function (req, res) {
  const { id } = req.query

  User.deleteById(Number(id))

  res.render('success-info', {
    style: 'success-info',
    info: 'Користувач видалений',
  })
})

router.get('/user-reduct', function (req, res) {
  const { id } = req.query

  const user = User.getById(Number(id))

  res.render('user-update', {
    style: 'user-update',
    user,
  })
})

router.post('/user-update', function (req, res) {
  const { id, email, login, password } = req.body

  const user = User.editById(id, { email, login, password })

  user
    ? res.render('success-info', {
        style: 'success-info',
        info: 'Користувач змінений',
      })
    : res.render('success-info', {
        style: 'success-info',
        info: 'Невірний пароль',
      })
})

router.get('/product-create', (req, res) => {
  res.render('product-create', {
    style: 'product-create',
  })
})

router.post('/product-create', (req, res) => {
  const { name, price, description } = req.body

  const product = new Product(name, price, description)

  Product.add(product)

  console.log(Product.getList())

  res.render('alert', {
    style: 'alert',
    info: 'Продукт доданий',
  })
})

router.get('/product-list', (req, res) => {
  res.render('product-list', {
    style: 'product-list',
    products: Product.getList(),
  })
})

router.get('/product-edit', (req, res) => {
  const { id } = req.query

  const product = Product.getById(Number(id))

  res.render('product-edit', {
    style: 'product-edit',
    product,
  })
})

router.post('/product-edit', (req, res) => {
  const { id, ...data } = req.body

  console.log(data)

  Product.updateById(Number(id), data)

  console.log(Product.getList())

  res.render('alert', {
    style: 'alert',
    info: 'Товар змінений',
  })
})

router.get('/product-delete', (req, res) => {
  const { id } = req.query

  Product.deleteById(Number(id))

  res.render('alert', {
    style: 'alert',
    info: 'Товар видалений',
  })
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
