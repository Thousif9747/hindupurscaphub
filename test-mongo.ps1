$uri = Read-Host "Paste MONGODB_URI (with /scrap before the ?)"
Set-Content -Path "$env:TEMP\mongo-test-uri.txt" -Value $uri
$env:U = $uri
cd "E:\scrap hub\server"
node -e "const{MongoClient}=require('mongodb');new MongoClient(process.env.U).connect().then(async c=>{const d=c.db();await d.collection('t').insertOne({ok:1});console.log('CONNECTED OK -> db =',d.databaseName);await c.close()}).catch(e=>console.log('FAILED:',e.message))"
if ($?) { Read-Host "`nPress Enter to close" }
