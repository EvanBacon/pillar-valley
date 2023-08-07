import ExpoModulesCore

public class ExpoAppIconModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAppIcon")

    Constants([
      "isSupported": UIApplication.shared.supportsAlternateIcons
    ])

    AsyncFunction("setAlternateIcon") { (name: String?, promise: Promise) in
        if UIApplication.shared.supportsAlternateIcons {
            UIApplication.shared.setAlternateIconName(name) { error in
                if let error = error {
                    promise.reject(error)
                } else {
                    promise.resolve(UIApplication.shared.alternateIconName)
                }
            }
        } else {
            promise.resolve(nil)
        }
    }

    Function("getAlternateIcon") { () -> String? in
      if UIApplication.shared.supportsAlternateIcons {
          return UIApplication.shared.alternateIconName
      }

      return nil
    }
  }
}
