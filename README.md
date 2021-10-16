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
* Show admin creds by email
```
afk show --admin --email example@email.com --username mysql_username --password mysql_password
```
* Show users creds by email
```
afk show --email example@email.com --username mysql_username --password mysql_password
```
* Add admin
```
afk add --admin --email example@email.com --username mysql_username --password mysql_password
```
* Add user with auto-generate password
```
afk add --email example@email.com --username mysql_username --password mysql_password
```
* Add user with manually inputed password
```
afk add --email example@email.com --generate test_password --username mysql_username --password mysql_password
```
* Assign user to project
```
afk assign --email example@email.com --task test_project_name --scope read,write --username mysql_username --password mysql_password
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
* Uninstall CLI
```
sudo npm rm afk -g
```