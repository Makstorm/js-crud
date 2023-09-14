// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Product {
  static #list = []

  static #count = 0

  constructor(
    img,
    title,
    description,
    category,
    price,
    amount = 0,
  ) {
    this.id = ++Product.#count
    this.img = img
    this.title = title
    this.description = description
    this.category = category
    this.price = price
    this.amount = amount
  }

  static add(...data) {
    this.#list.push(new Product(...data))
  }

  static getList() {
    return this.#list
  }

  static getById(id) {
    return this.#list.find((item) => item.id === id)
  }

  static getRandomList(id) {
    const filtered = this.#list.filter(
      (item) => item.id !== id,
    )

    const shuffledList = filtered.sort(
      () => Math.random() - 0.5,
    )

    return shuffledList.slice(0, 3)
  }
}

Product.add(
  'https://picsum.photos/200/300',
  'Компʼютер Artline Gaming (X43v31) AMD Ryzen 5 3600/',
  'AMD Ryren 5 3600 (3.6 - 4.2 GHz) / RAM 16 GB / HDD 1 TB /',
  [
    { id: 1, text: 'Готовий до відправки' },
    { id: 2, text: 'Топ продажів' },
  ],
  27000,
  10,
)
Product.add(
  'https://picsum.photos/200/300',
  'Компʼютер Artline Gaming (X43v31) AMD Ryzen 5 3600/',
  'AMD Ryren 5 3600 (3.6 - 4.2 GHz) / RAM 16 GB / HDD 1 TB /',
  [
    { id: 1, text: 'Готовий до відправки' },
    { id: 2, text: 'Топ продажів' },
  ],
  27000,
  10,
)
Product.add(
  'https://picsum.photos/200/300',
  'Компʼютер Artline Gaming (X43v31) AMD Ryzen 5 3600/',
  'AMD Ryren 5 3600 (3.6 - 4.2 GHz) / RAM 16 GB / HDD 1 TB /',
  [
    { id: 1, text: 'Готовий до відправки' },
    { id: 2, text: 'Топ продажів' },
  ],
  27000,
  10,
)

class Purchase {
  static DELIVERY_PRICE = 150
  static #BONUS_FACTOR = 0.1

  static #list = []

  static #count = 0

  static #bonusAccount = new Map()

  static getBonusBalance = (email) => {
    return this.#bonusAccount.get(email) || 0
  }

  static calcBonusAmount = (value) => {
    return value * this.#BONUS_FACTOR
  }

  static updateBonusBalance = (
    email,
    price,
    bonusUse = 0,
  ) => {
    const amount = this.calcBonusAmount(price)

    const currentBalance = this.getBonusBalance(email)

    const updatedBalance =
      currentBalance + amount - bonusUse

    this.#bonusAccount.set(email, updatedBalance)

    console.log(email, updatedBalance)

    return amount
  }

  constructor(data, product) {
    this.id = ++Purchase.#count

    this.firstname = data.firstname
    this.lastname = data.lastname

    this.phone = data.phone
    this.email = data.email

    this.comment = data.comment || null
    this.bonus = data.bonus || 0
    this.promocode = data.promocode || null

    this.totalPrice = data.totalPrice
    this.productPrice = data.productPrice
    this.deliveryPrice = data.deliveryPrice

    this.product = product
    this.amount = data.amount
  }

  static add(...arg) {
    const newPurchase = new Purchase(...arg)

    this.#list.push(newPurchase)

    return newPurchase
  }

  static getList() {
    return this.#list
      .reverse()
      .map((item) => ({
        ...item,
        bonus: this.calcBonusAmount(item.totalPrice),
      }))
  }

  static getById(id) {
    return this.#list.find((item) => item.id === id)
  }

  static updateById(id, data) {
    const purchase = this.getById(id)

    if (purchase) {
      if (data.firstname) {
        purchase.firstname = data.firstname
      }
      if (data.lastname) {
        purchase.lastname = data.lastname
      }
      if (data.phone) {
        purchase.phone = data.phone
      }
      if (data.email) {
        purchase.email = data.email
      }

      return true
    } else {
      return false
    }
  }
}

class Promocode {
  static #list = []

  constructor(name, factor) {
    this.name = name
    this.factor = factor
  }

  static add(name, factor) {
    const newPromocode = new Promocode(name, factor)
    this.#list.push(newPromocode)
    return newPromocode
  }

  static getByName(name) {
    return this.#list.find((item) => item.name === name)
  }

  static calc(promo, price) {
    return price * promo.factor
  }
}

Promocode.add('SUMMER2023', 0.9)

// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки

router.get('/purchase-list', function (req, res) {
  res.render('purchase-index', {
    style: 'purchase-index',
    data: {
      list: Product.getList(),
    },
  })
})

router.get('/purchase-product', (req, res) => {
  const id = Number(req.query.id)

  res.render('purchase-product', {
    style: 'purchase-product',

    data: {
      list: Product.getRandomList(id),
      product: Product.getById(id),
    },
  })
})

router.post('/purchase-create', (req, res) => {
  const id = Number(req.query.id)
  const amount = Number(req.body.amount)

  if (amount < 1) {
    res.render('purchase-alert', {
      style: 'purchase-alert',
      data: {
        message: 'error',
        info: 'Amount must be greater than zero',
        link: `/purchase-product?id=${id}`,
      },
    })
  }

  const product = Product.getById(id)

  if (product.amount < amount) {
    res.render('purchase-alert', {
      style: 'purchase-alert',
      data: {
        message: 'Помилка',
        info: 'Недостатньо товару',
        link: `/purchase-product?id=${id}`,
      },
    })
  }

  const productPrice = product.price * amount

  const totalPrice = productPrice + Purchase.DELIVERY_PRICE

  const bonus = Purchase.calcBonusAmount(totalPrice)

  res.render('purchase-create', {
    style: 'purchase-create',

    data: {
      id: product.id,

      cart: [
        {
          text: `${product.title} (${amount})`,
          price: productPrice,
        },
        {
          text: 'Доставка',
          price: Purchase.DELIVERY_PRICE,
        },
      ],
      product: Product.getById(id),
      totalPrice,
      productPrice,
      deliveryPrice: Purchase.DELIVERY_PRICE,
      amount,
      bonus,
    },
  })
})

router.post('/purchase-submit', (req, res) => {
  const id = Number(req.query.id)

  let {
    totalPrice,
    productPrice,
    deliveryPrice,
    amount,
    firstname,
    lastname,
    email,
    phone,

    promocode,
    bonus,
  } = req.body

  const product = Product.getById(id)

  if (!product) {
    return res.render('purchase-alert', {
      style: 'purchase-alert',
      data: {
        message: 'Помилка',
        info: 'товара не знайдено',
        link: '/purchase-list',
      },
    })
  }

  totalPrice = Number(totalPrice)
  productPrice = Number(productPrice)
  deliveryPrice = Number(deliveryPrice)
  amount = Number(amount)
  bonus = Number(bonus)

  if (
    isNaN(totalPrice) ||
    isNaN(productPrice) ||
    isNaN(deliveryPrice) ||
    isNaN(amount)
  ) {
    return res.render('purchase-alert', {
      style: 'purchase-alert',
      data: {
        message: 'Помилка',
        info: 'некоректні дані',
        link: '/purchase-list',
      },
    })
  }

  if (!firstname || !lastname || !email || !phone) {
    return res.render('purchase-alert', {
      style: 'purchase-alert',
      data: {
        message: 'Помилка',
        info: 'заповніть обовʼязекові поля',
        link: '/purchase-list',
      },
    })
  }

  if (bonus && bonus > 0) {
    const bonusAmount = Purchase.getBonusBalance(email)

    if (bonus > bonusAmount) {
      bonus = bonusAmount
    }
    Purchase.updateBonusBalance(email, totalPrice, bonus)

    totalPrice -= bonus
  }
  if (promocode) {
    promocode = Promocode.getByName(promocode)

    if (promocode) {
      totalPrice = Promocode.calc(promocode, totalPrice)
    }
  } else {
    Purchase.updateBonusBalance(email, totalPrice, 0)
  }

  if (totalPrice < 0) totalPrice = 0

  const purchase = Purchase.add(
    {
      totalPrice,
      productPrice,
      deliveryPrice,
      amount,

      firstname,
      lastname,
      email,
      phone,

      promocode,
      bonus,
    },
    product,
  )

  console.log(purchase)

  res.render('purchase-alert', {
    style: 'purchase-alert',
    data: {
      message: 'Успішно',
      info: 'замовлення створено',
      link: '/purchase-list',
    },
  })
})

router.get('/purchase-info', (req, res) => {
  const id = Number(req.query.id)

  res.render('purchase-info', {
    style: 'purchase-info',

    data: Purchase.getById(id),
  })
})

router.get('/purchase-update', (req, res) => {
  const id = Number(req.query.id)

  res.render('purchase-update', {
    style: 'purchase-update',

    data: Purchase.getById(id),
  })
})

router.post('/purchase-reduct', (req, res) => {
  const id = Number(req.query.id)

  let { ...data } = req.body

  Purchase.updateById(id, data)

  res.render('purchase-alert', {
    style: 'purchase-alert',
    data: {
      message: 'Успішно',
      info: 'дані змінено',
      link: '/purchase-cart',
    },
  })
})

router.get('/purchase-cart', (req, res) => {
  const list = Purchase.getList()

  console.log(list)

  res.render('purchase-cart', {
    style: 'purchase-cart',

    data: list,
  })
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
