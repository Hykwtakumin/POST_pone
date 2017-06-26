$(function () {

  const bgPage = chrome.extension.getBackgroundPage()


  $('.toggle').toggles()

  $('.toggle').on('toggle',function (e, active) {
    bgPage.toggleState(active)
  })

  const login_form = document.getElementById('login_button')

  const user_id = localStorage.getItem('user_id')

  if (user_id !== ''){
    console.log('already sign in')
    $('#alert_reviewMode').remove()
    $('#login_button').remove()
  }

  login_form.addEventListener('click', function () {
    bgPage.authTwitter()
  })


})