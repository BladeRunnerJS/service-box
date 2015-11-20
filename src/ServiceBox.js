/*eslint no-loop-func: 0*/

function resolveNextService(servicesToResolve, factories, services) {
  const promises = [];
  let i = 0;

  while(i < servicesToResolve.length) {
    const name = servicesToResolve[i++];
    const factory = factories[name];

    if(!services[name]) {
      const unmetDependencies = factory.dependencies.filter(dep => !services[dep]);
      const dependenciesMet = unmetDependencies.length === 0;

      if(!dependenciesMet) {
        const newDependencies = unmetDependencies.filter(dep => servicesToResolve.indexOf(dep) === -1);
        servicesToResolve = servicesToResolve.concat(newDependencies);
      }
      else {
        promises.push(factory().then(function(service) {
          services[name] = service;
        }));
      }
    }
  }

  return (promises.length === 0) ? false : Promise.all(promises);
}

export default class ServiceBox {
  constructor() {
    this.factories = {};
    this.services = {};
  }

  register(name, factory) {
    if(this.factories[name]) {
      throw new Error(`A factory with the name '${name}' has already been registered.`);
    }

    if(!factory.dependencies) {
      factory.dependencies = [];
    }

    this.factories[name] = factory;
  }

  resolve(names) {
    const promise = resolveNextService(names, this.factories, this.services);

    if(promise) {
      return promise.then(() => {
        return this.resolve(names);
      });
    }
    else {
      return Promise.resolve();
    }
  }

  resolveAll() {
    return this.resolve(Object.keys(this.factories));
  }

  get(name) {
    if(!this.services[name]) {
      if(this.factories[name]) {
        throw new Error(`The '${name}' service needs to be resolved before you can retrieve it.`);
      }
      else {
        throw new Error(`No service called '${name}' has been registered.`);
      }
    }

    return this.services[name];
  }
}
