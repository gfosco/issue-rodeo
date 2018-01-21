
let moment = require('moment')
let express = require('express')
let _ = require('lodash')

const octokit = require('@octokit/rest')({
  timeout: 0,
  requestMedia: 'application/vnd.github.v3+json',
  headers: {
    'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
  }
})

let token = process.env.GITHUB_TOKEN

if (token) {
  octokit.authenticate({
    type: 'token',
    token: token
  })
} else {
  console.log('Running without authentication, rate limit will be extremely low.')
}

let app = express()

app.use('/_/', express.static('_'))

app.set('view engine', 'pug')

app.get('/:org/:repo', (req, res) => {
  console.log(req.params.org, req.params.repo)
  if (req.params.org == '_') {
    return res.render('index', {title: 'Issue Rodeo'})
  }
  octokit.issues.getForRepo({
    owner: req.params.org,
    repo: req.params.repo,
    state: 'open',
    per_page: 10,
    sort: 'updated',
    direction: 'asc'
  }, (e, r) => {
    if (e) {
      console.log('EE: ', req.params.org, req.params.repo)
      res.render('index', {title: 'Issue Rodeo'})
    } else {
      res.render('repo', {
        repo: req.params.org + '/' + req.params.repo,
        data: r.data,
        title: 'Issue Rodeo - ' + req.params.org + '/' + req.params.repo
      })
    }
  })
})

app.get('*', (req, res) => {
  res.render('index', { title: 'Issue Rodeo' })
})

app.listen(3000, () => console.log('Issue.rodeo up and running.'))
