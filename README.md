[![Build Status](https://travis-ci.org/BladeRunnerJS/service-box.png)](https://travis-ci.org/BladeRunnerJS/service-box)

# service-box

'service-box' is a service registry for doing IoC within JavaScript apps. It differs from other _service-registries_ / _service-locators_ / _ioc-containers_ in that it allows services to be created asynchronously while depending on other services that might also be created asynchronously, yet allows apps to synchronously retrieve services for simplicity.

## Registry Initialization

You create your service registry like this:

~~~js
import ServiceBox from 'service-box';
const serviceBox = new ServiceBox();
~~~

Before your app starts, you register factories for all of the services you have like this:

~~~js
import {serviceFactory} from 'service-box';
import LogService from './LogService.js';
serviceBox.register('log-service', serviceFactory(LogService));
~~~

or, if you want / need to create the service-factory manually, then like this:

~~~js
import LogService from './LogService.js';

serviceBox.register('log-service', function logServiceFactory() {
	return Promise.resolve(new LogService());
});
~~~

A service-factory is just a function that returns a promise containing the actual service. We use promises because some services only become available for use after they've initialized themselves by connecting to a server. We use service factories so that services can be registered in any order, avoiding the need for apps to transitively register a service's dependencies before registering the service itself.

Service factories can indicate whether the service they provide is dependent on other services by setting the `dependencies` property on the service factory, for example:

~~~js
import PermissionService from './PermissionService.js';

function permissionServiceFactory() {
	const userService = serviceBox.get('user-service');
	return fetch(`./permisions/{userService.getUserId()}`).then(function(userPerms) {
		return new PermissionService(userPerms);
	});
};
permissionServiceFactory.dependencies = ['user-service'];

serviceBox.register('permission-service', permissionServiceFactory);
~~~

If the permissions for a given user were available directly from the user service as `userService.getUserPerms()`, then `PermissionService` could have requested these within its constructor, and we could have used the `serviceFactory` wrapper again, like so:

~~~js
import {serviceFactory} from 'service-box';
serviceBox.register('permission-service',
	serviceFactory(PermissionService, ['user-service']));
~~~

## In-App Usage

Apps can ensure that the services they need are available using `serviceBox.resolveAll()` as follows:

~~~js
serviceBox.resolveAll().then(function() {
	// do app stuff here...
});
~~~

or, if they want to start doing useful work without creating all of the services, or before all of the dependent services have been registered, they can instead use `serviceBox.resolve(services)`, like so:

~~~js
serviceBox.resolve(['log-service', 'permission-service']).then(function() {
	// do app stuff here...
});
~~~

As we saw earlier, services are retrieved synchronously using the `serviceBox.get()` method. If a service isn't currently available then an error is thrown, and the app will need to be modified so that it correctly resolves the service first.
