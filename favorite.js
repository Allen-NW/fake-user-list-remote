'use strict'

const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users'

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

const USER_PER_PAGE = 12
const users = JSON.parse(localStorage.getItem('Fake-Friend'))
let filteredUsers = []

//新增事件區
//資料點擊事件
dataPanel.addEventListener('click', event => {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-fakeFriend')) {
    removeFromFakeFriend(Number(event.target.dataset.id))
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
    <div class="col-sm-2 mt-5 mr-5">
      <div class="mb-2 shadow-sm mb-5 bg-light rounded">
        <div class="card">
            <img src="${item.avatar}" class="card-img-top" alt="User Image">
          <div class="card-body">
            <h5 class="card-title text-center">${item.name}</h5>
            <div class="card-footer d-flex align-item-center justify-content-around">
              <button class="btn btn-show-user mr-2" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-fakeFriend" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    dataPanel.innerHTML = rawHTML
  })
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

  if (numberOfPage < 1) {
    rawHTML += `<h1>There is not any fake-user, please back to home and add some.</h1>`
  } else {
    for (let page = 1; page <= numberOfPage; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
  }

  paginator.innerHTML = rawHTML
}

function removeFromFakeFriend(id) {
  if (!users) return

  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return

  users.splice(userIndex, 1)
  localStorage.setItem('Fake-Friend', JSON.stringify(users))
  renderUserList(users)
}

renderPaginator(users.length)
renderUserList(users)