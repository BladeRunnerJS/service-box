export default function serviceFactory(ServiceClass, dependencies) {
  const factory = function() {
    return Promise.resolve(new ServiceClass());
  };
  factory.dependencies = dependencies;

  return factory;
}
