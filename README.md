## Afkanerd developers manager
### Requirements
- MySQL (MariaDB)
- nodejs
- npm

### Installation

* Install all node packages
```
npm install
```
* Install CLI Tool
```
sudo npm install -g
```
### Setup
* Create configuration file

    __root (./)__

    * To set up database and API, copy the template file "example.config.json" and rename to "config.json"
* Configure CLI database
```
afk config -d <database_name>
``` 
e.g
```
afk config -d test_db
```

> Note: Use same database for CLI and API
### Start Server
```bash
npm start
```
### API SandBox
```
http://localhost:{PORT}/api-docs
```
### CLI Commands
* Show creds by email
```
afk show --email example@email.com --username test_username --password test_password
```
* Add admin
```
afk add --email example@email.com --username test_username --password test_password
```
* Update CLI database
```
afk config --database test_db
```
* Get help
```
afk --help
```
* Get help per Command 
```
afk [command] --help
```
e.g
```
afk show --help
```