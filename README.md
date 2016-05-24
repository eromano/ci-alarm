<h1 align="center">Ci Alarm</h1>
<p align="center">
  <img alt='ci alarm logo' src='ci-alarm-logo.png' title='Ci Alarm logo' />
</p>
<p align="center">
    <a title='Build Status' href="https://travis-ci.org/eromano/ci-alarm">
        <img src='https://travis-ci.org/eromano/ci-alarm.svg?branch=master' alt='travis Status' />
    </a>
    <a title='Appveyor Status' href='https://ci.appveyor.com/project/eromano/ci-alarm'>
        <img src='https://ci.appveyor.com/api/projects/status/github/eromano/ci-alarm?svg=true' alt='appveyor status' />
    </a>
    <a title='coveralls Status' href='https://coveralls.io/r/eromano/ci-alarm'>
        <img src='https://img.shields.io/coveralls/eromano/ci-alarm.svg' alt='Coverage Status' />
    </a>
    <a title='license' href='https://github.com/eromano/ci-alarm/blob/master/LICENSE'>
        <img src='https://img.shields.io/badge/license-MIT-blue.svg' alt='license' />
    </a>
</p>
<p align="center">
    <a title='closed issue' href='http://issuestats.com/github/eromano/ci-alarm'>
        <img src='http://issuestats.com/github/eromano/ci-alarm/badge/issue' alt='issue stats' />
    </a>
    <a title='blog' href='http://eromano.github.io'>
       <img src='https://img.shields.io/badge/style-blog-blue.svg?label=my' alt='blog' />
    </a>
    <a title='unicorn video' href='https://www.youtube.com/watch?v=9auOCbH5Ns4'>
        <img src='https://img.shields.io/badge/unicorn-approved-ff69b4.svg' alt='unicorn' />
    </a>
</p>

## About Ci-alarm
>Ci-alarm is a  node.js slack bot to help you to communicate with Travis CI.

With this bot you can :
* Get in yor slack chat all the info about your Travis Ci and repositories
* Restart Build
* Turn on a light alarm through GPIO of the Raspberry Pi when your Travis build fail

## Getting Started
1. Create a new [bot integration](https://my.slack.com/services/new/bot)
1. Choose between **One-Click Heroku** or **Manual Heroku**

 - **One-Click Heroku**
       Click this button:

       [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

 - **Manual Heroku**
    *  Install [Heroku toolbelt](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)
    * Create a new bot integration (as above)
    *  `heroku create`
    *  `heroku config:set TOKEN_SLACK=[Your Slack bot integration token (obtainable at https://my.slack.com/services/new/bot)]`
    *  `heroku config:set TOKEN_GITHUB=[Your Git hub private token bot integration token (obtainable at https://github.com/settings/tokens) scope needed repo and user]`
    *  `heroku config:set TOKEN_TRAVIS=[Your Travis token (obtainable at https://travis-ci.org/profile/{your_username})]`
    *  `git push heroku master`


1. Have fun
Once the bot is running see the documentation for the [Command list](https://github.com/eromano/ci-alarm/wiki/Command-List)

## Command list

* To show the command list

    ```@BotName command list ``` or     ```@BotName help ```
<p align="left" >
  <img title="ci alarm" src='doc/img/command list.png' width="400px"/>
</p>

* To show the repository status

    ```@BotName status "[repository name|repository slugName]" ```

<p align="left" >
  <img title="ci alarm" src='doc/img/status.png'  width="400px"/>
</p>

* To show the repository list

    ```@BotName repository list ```

<p align="left"  >
  <img title="ci alarm" src='doc/img/repo list.png' width="400px"/>
</p>

* To build a project on Travis

    ```@BotName rebuild "[repository name|repository slugName]" ```

* To view the build history of a project

    ```@BotName history "[repository name|repository slugName]" ```

* To view info about a project

    ```@BotName info "[repository name|repository slugName]" ```

* To view the status about all your repository

    ```@BotName report" ```


## Plug-In

<div>
    <div align="left" width="70%"  >
    Ci Alarm is also able to turn on/off a alarm light when the build is failing.
    In order to have this kind of plug-in you have to install ci-alarm on a Raspberry PI.
    All the specification for this kind of configuration are [here](https://github.com/eromano/ci-alarm/blob/master/doc/README.md).
    </div>

    <div align="left"  width="20%" >
      <img title="ci alarm light alarm schema components" src='doc/img/raspberry-pi-logo.png' width="70px" height="80px"  />
    </div>
</div>


## Development

* To test ci-alarm

    ```$ npm run-script test```

* To debug ci-alarm

    ```$ npm run-script debug```

* To see the test coverage ci-alarm

    ```$ npm run-script coverage```

* To run ci-alarm on your machine

    ```$ npm run-script start```


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b ci-alarm`
3. Commit your changes: `git commit -a `
4. Push to the branch: `git push origin ci-alarm`
5. Submit a pull request

## History

For detailed changelog, check [Releases](https://github.com/eromano/ci-alarm/releases).

### Contributors

Contributor | GitHub profile | Twitter profile |
--- | --- | ---
Eugenio Romano (Creator) | [eromano](https://github.com/eromano) | [@RomanoEugenio](https://twitter.com/RomanoEugenio)

