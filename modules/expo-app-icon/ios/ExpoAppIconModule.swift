import ExpoModulesCore

public class ExpoAppIconModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoAppIcon")
        
        Constants([
            "isSupported": UIApplication.shared.supportsAlternateIcons
        ])
        
        AsyncFunction("setAlternateIcon") { (name: String?, promise: Promise) in
            if UIApplication.shared.supportsAlternateIcons {
                // self.setAppIconWithoutAlert(name)
                // promise.resolve(name)
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
        }.runOnQueue(.main)
        
        AsyncFunction("getAlternateIcon") { (promise: Promise) in
            
            if UIApplication.shared.supportsAlternateIcons {
                promise.resolve(UIApplication.shared.alternateIconName)
                return
            }
            
            promise.resolve(nil)
            
        }.runOnQueue(.main)
    }

    // private func setAppIconWithoutAlert(_ iconName: String?) {
    //     if UIApplication.shared.responds(to: #selector(getter: UIApplication.supportsAlternateIcons)) && UIApplication.shared.supportsAlternateIcons {
    //         typealias setAlternateIconName = @convention(c) (NSObject, Selector, NSString?, @escaping (NSError) -> ()) -> ()
            
    //         let selectorString = "_setAlternateIconName:completionHandler:"
            
    //         let selector = NSSelectorFromString(selectorString)
    //         let imp = UIApplication.shared.method(for: selector)
    //         let method = unsafeBitCast(imp, to: setAlternateIconName.self)
    //         method(UIApplication.shared, selector, iconName as NSString?, { _ in })
    //     }
    // }
}
