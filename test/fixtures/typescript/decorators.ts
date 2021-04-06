function decorator (...args: any) {
  console.log('Decorator called with arguments:', args)
}

@decorator
export default class DecoratedClass {
  @decorator
  decoratedProperty = null

  @decorator
  get decoratedAccessor () {
    return null
  }

  @decorator
  decoratedFunction (@decorator decoratedParameter: any) {
    return decoratedParameter
  }
}
