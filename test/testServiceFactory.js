import ServiceBox from '../src/ServiceBox.js';
import testServiceFactory from '../src/serviceFactory.js';
import chai from 'chai';
const expect = chai.expect;

describe('ServiceBox', function() {
  let serviceBox;

  const ServiceClass = class {
    constructor() {
      this.name = 'Service Instance';
    }
  };

  const DependentServiceClass = class {
    constructor() {
      const serviceName = serviceBox.get('service').name;
      this.name = `Dependent Service Instance (depends on '${serviceName}')`;
    }
  };

  beforeEach(function() {
    serviceBox = new ServiceBox();
  });

  it('instantiates the provided service class', function() {
    serviceBox.register('the-service', testServiceFactory(ServiceClass));

    return serviceBox.resolveAll().then(function() {
      expect(serviceBox.get('the-service').name).to.equal('Service Instance');
    });
  });

  it('allows a services dependencies to be taken into account', function() {
    serviceBox.register('service', testServiceFactory(ServiceClass));
    serviceBox.register('dependent-service', testServiceFactory(DependentServiceClass, ['service']));

    return serviceBox.resolve(['dependent-service']).then(function() {
      expect(serviceBox.get('service').name).to.equal('Service Instance');
      expect(serviceBox.get('dependent-service').name).to.equal('Dependent Service Instance (depends on \'Service Instance\')');
    });
  });
});
