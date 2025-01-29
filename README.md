## **nextCart**
This project rewrites [expressCart](https://github.com/atmulyana/expressCart) project by using *Nextjs*. It can also
serve as a server for [expressCartMobile](https://github.com/atmulyana/expressCartMobile) app.

#### **Database**
As *expressCart*, this application uses #MongoDb*. However, it uses *replicaset* to allow the execution of database
transaction. The database transaction keeps the data integrity. To create a *replicaset*, add the lines below to
`mongod.conf` file:

    replication:
      replSetName: "rs0"
      oplogSizeMB: 2000

Then restart *MongoDb* server. After that, open mongo shell by typing console command:

    mongosh

After mongo shell shows up, type the command:

    rs.initiate()

Make sure, you get response a JSON which includes **`ok: 1`**. You may exit from mongo shell by typing `exit`.
You must also include the name of *replicaset* (in this case, it's `rs0`) in the connection string of database.
If don't change the name of *replicaset* then you do nothing because we have set `databaseConnectionString` in
`config.json` to be <code>mongodb://127.0.0.1:27017/nextcart?<strong>replicaSet=rs0</strong></code>.
  
For initial database, you may restore the database from the backup packaged in this project. Type the command
below in console after you change the current directory to the top directory of project:

    mongorestore ./_db

It's assumed your database server at IP and port `127.0.0.1:27017`. If not, you may use `--uri` option. Please
find the documentation for using it.

#### **How to run the application**
For development, you can run the application by the console command:

    npm run dev