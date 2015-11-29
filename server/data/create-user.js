var server = require('../server');
var dataSource = server.dataSources.ordrDB;

var User = server.models.User;
var Role = server.models.Role;
var RoleMapping = server.models.RoleMapping;
var ACL = server.models.ACL;
var AccessToken = server.models.AccessToken;

User.create({username: 'root', password: 'root', email:'root@root.com'}, function(err, user) {

  Role.create({name: 'userRole'}, function(err, userRole) {

    console.log(userRole);
    console.log(RoleMapping.ROLE);
    console.log(userRole.id);

    userRole.principals.create({principalType: RoleMapping.ROLE, principalId: userRole.id}, function(err, mapping) {

      console.log(mapping);
    });
  });
});

/*
dataSource.automigrate('User', function(error) {
  if (error) throw error;

  console.log('User model migrated');
  //dataSource.disconnect();
});

dataSource.automigrate('AccessToken', function(error) {
  if (error) throw error;

  console.log('AccessToken model migrated');
  //dataSource.disconnect();
});

dataSource.automigrate('ACL', function(error) {
  if (error) throw error;

  console.log('ACL model migrated');
  //dataSource.disconnect();
});

dataSource.automigrate('RoleMapping', function(error) {
  if (error) throw error;

  console.log('RoleMapping model migrated');
  //dataSource.disconnect();
});

dataSource.automigrate('Role', function(error) {
  if (error) throw error;

  console.log('Role model migrated');
  dataSource.disconnect();
});*/
