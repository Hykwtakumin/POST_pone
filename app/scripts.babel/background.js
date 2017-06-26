
// let socket = io('https://postpone.herokuapp.com:3000'); //TODO : dotenvify
// socket.on('connect', function(){});
// socket.on('event', function(data){});
// socket.on('disconnect', function(){});


let peerReview = false
let isoverlapped = false

let username = ''
let user_id = ''
let follows = []
let followers = []
let reviewers = []

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.setBadgeText({text: '\'test'})

function authTwitter() {
  console.log('login button clicked')
  OAuth.initialize('XOt1xGUW-ZsLJZuDPP4idc5yNfI') //TODO : dotenvify
  OAuth.popup('twitter')  //TODO : devide Request object
    .done(function (results) {
      console.log('auth succeeded')
      let auth_Token = results.oauth_token.toString()
      let auth_Token_Secret = results.oauth_token_secret.toString()

      results.get('/1.1/account/verify_credentials.json')
        .done(function (res) {
          username = res.screen_name
          user_id = res.user_id
        })
        .fail(function (error) {
          console.log(error)
        })

      results.get('/1.1/friends/list.json', {
        screen_name: username,
        count: 200,
        skip_status: true,
        include_user_entities: false
      })
        .done(function (res) {
          const follow_list = res.users
          for (let i = 0; i < follow_list.length; i++) {
            const follow_name = follow_list[i].screen_name
            // console.log('follows : ', follow_name)
            follows[i] = follow_name
          }
        })
        .then(function () {
          localStorage.setItem('follows', JSON.stringify(follows))
          //JSON.parse(localStorage.getItem('follows'))
        })
        .fail(function (error) {
          console.log(error)
        })

      results.get('/1.1/followers/list.json', {
        screen_name: username,
        count: 200,
        skip_status: true,
        include_user_entities: false
      })
        .done(function (res) {
          const follower_list = res.users
          for (let i = 0; i < follower_list.length; i++) {
            const follower_name = follower_list[i].screen_name
            // console.log('followers : ', follower_name)
            followers[i] = follower_name
          }
        })
        .then(function () {
          console.log(follows)
          console.log(followers)
          localStorage.setItem('followers', JSON.stringify(followers))
          //JSON.parse(localStorage.getItem('followers'))
          createReviewrlist()
        })
        .fail(function (error) {
          console.log(error)
        })

    })
    .fail(function (error) {
      console.log(error)
    })
}
// function logoutTwitter(){} //TODO : implement signout method

function createReviewrlist() {

  const marged_list = follows.concat(followers)

  reviewers = marged_list.filter(function (x, i, self) {
    return self.indexOf(x) !== self.lastIndexOf(x)
  })

  localStorage.setItem('reviewers', JSON.stringify(reviewers))
  //JSON.parse(localStorage.getItem('reviewers'))

  console.log(reviewers)

}

function toggleState(active) {
  if(active){
    console.log('review mode enable')
    peerReview = true
  }else{
    console.log('review mode disable')
    peerReview = false
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {

    if(details.requestBody.formData.status.toString() !== localStorage['tweet_text']){
      localStorage['tweet_text'] = details.requestBody.formData.status.toString();
      isoverlapped = false;
    }else{
      isoverlapped = true;
      console.log('重複が存在します');
    }
    localStorage['in_reply_to_status_id'] = details.requestBody.formData.in_reply_to_status_id.toString();
    // console.log('sendBody=' + details.requestBody.requestBody.formData.toString());
    return {cancel: false};
  },
  {urls: ['*://twitter.com/i/tweet/create*','*://twitter.com/i/tweet/retweet*','https://api.twitter.com/1.1/statuses/update.json']},
  ['requestBody','blocking']);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details){
    // localStorage['localHeader'] = details.requestHeaders ;
    localStorage['repURL'] = details.requestHeaders[6].value;
    console.log(localStorage['repURL']);

    // if(localStorage['tweet_text'].indexOf('@') !== -1){
    //   requestReview();
    //   return {cancel: true};
    // }else{
    //   return {cancel: false};
    // }

    if(peerReview){
      requestReview();
      return {cancel: true};
    }else{
      return {cancel: false};
    }

  },
  {urls: ['*://twitter.com/i/tweet/create*','*://twitter.com/i/tweet/retweet*','https://api.twitter.com/1.1/statuses/update.json']},
  ['requestHeaders','blocking']);

function requestReview() {
  if (!isoverlapped){
    new Notification('POST_pone', { tag: 'dev', body: '次のツイートが取り置かれました\n' + localStorage['tweet_text'] });

    //TODO : implement socket.io method
    // socket.emit('post_tweet',{
    // }, function onack(response){
    //   console.log(response);
    //   if(response.confirm_result){
    //     new Notification('POST_pone', { tag: 'dev', body: '投稿が承認されました!'});
    //   }else{
    //     new Notification('POST_pone', { tag: 'dev', body: '査読結果が出ました。\n' + response.draft_Text });
    //   }
    // });
  }else{
    console.log('重複が存在するので送信しませんでした');
  }
}

//TODO : implement socket.io method
// socket.on('confirm_tweet', function (data) {
//   console.log('tweet confirmed!');
//   console.log(data);
//   return {cancel: false};
// });
//
// socket.on('resend_tweet', function (data) {
//   console.log('tweet confirmed!');
//   new Notification('POST_pone', { tag: 'dev', body: '査読結果が来ました。\n' + data.draft_Text });
// });





