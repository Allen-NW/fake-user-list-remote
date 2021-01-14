'use strict'

const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users'

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

const USER_PER_PAGE = 12
const users = []
let filteredUsers = []

//新增事件區
//資料點擊事件
dataPanel.addEventListener('click', event => {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-fakeFriend')) {
    addToFakeFriend(Number(event.target.dataset.id))
  }
})

//搜尋繳交事件
searchForm.addEventListener('submit', function OnSearchFromSubmitted(event) {
  //取消此元件所有預設
  event.preventDefault()
  //擷取輸入內容，忽略前後空格，並轉為小寫
  const keyword = searchInput.value.trim().toLowerCase()

  //將users裡面所有user的name與keyword做比對
  //，如果是true，將此使用者資料放進filterUsers裡面
  filteredUsers = users.filter((user) => user.name.toLowerCase().includes(keyword))

  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword} 沒有相符合的結果，請再輸入一次`)
  }

  renderPaginator(filteredUsers.length)
  renderUserList(getUserByPage(1))
})

//分頁點擊事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //若點擊到的元件的html標籤不為a標籤，結束此函式
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderUserList(getUserByPage(page))
})

//函式區
//顯示Modal
function showUserModal(id) {
  const modalImage = document.querySelector('#modal-user-avatar')
  const modalName = document.querySelector('#modal-user-name')
  const modalEmail = document.querySelector('#modal-user-email')
  const modalAge = document.querySelector('#modal-user-age')

  axios
    .get(`${INDEX_URL}/${id}`)
    .then(response => {
      const data = response.data
      modalImage.innerHTML = `<img src="${data.avatar}" alt="User Image">`
      modalName.innerText = `${data.name} ${data.surname}`
      modalEmail.innerText = `Email: ${data.email}`
      modalAge.innerText = `Age: ${data.age}`
    })
    .catch(err => console.log(err))
}

//印出data裡所有user名單
function renderUserList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //image, name
    rawHTML += `
    <div class="col-12 col-md-4 col-lg-2 mt-5 mr-5">
      <div class="mb-2 shadow mb-5 bg-light rounded">
        <div class="card container-fluid">
          <div class="row">
            <img src="${item.avatar}" class="card-img-top" alt="User Image">
            <div class="card-body container-fluid">
              <div class="row justify-content-center">
                <h5 class="card-title col-6 col-md-12 align-self-center">${item.name}</h5>
                <div class="card-footer col-6 col-md-12 container">
                  <div class="row">
                    <button class="btn btn-show-user col-6" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
                    <button class="btn btn-info btn-add-fakeFriend col-4 offset-2" data-id="${item.id}">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    dataPanel.innerHTML = rawHTML
  })
}

//將選中的user加進localStorage裡
function addToFakeFriend(id) {
  //FakeFriend-List不是JS資料就是空集合
  const list = JSON.parse(localStorage.getItem('Fake-Friend')) || []
  //find只會找第一個滿足此函式的元素值
  const user = users.find((user) => user.id === id)

  //some會測試是不是至少有一個滿足函式，會回傳布林值
  if (list.some((user) => user.id === id)) {
    return alert('此使用者已被加入假朋友清單')
  }

  list.push(user)
  localStorage.setItem('Fake-Friend', JSON.stringify(list))
}

//設計好每個分頁有幾個user
function getUserByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USER_PER_PAGE

  return data.slice(startIndex, startIndex + USER_PER_PAGE)
}

//印出所有分頁
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

axios
  .get(INDEX_URL)
  .then(response => {
    users.push(...response.data.results)
    renderPaginator(users.length)
    renderUserList(getUserByPage(1))
    console.log(users)
  })
  .catch(err => console.log(err))