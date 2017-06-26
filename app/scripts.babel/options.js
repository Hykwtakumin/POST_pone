
const bgPage = chrome.extension.getBackgroundPage()

const login_form = document.getElementById('login_button')
const logout_form = document.getElementById('logout_button')

login_form.addEventListener('click', function () {
  bgPage.authTwitter()
})

// logout_form.addEventListener('click', function () {
//   // bgPage.logoutTwitter()
// })