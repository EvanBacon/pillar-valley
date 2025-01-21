import ExpoModulesCore
import StoreKit


internal class MissingCurrentWindowSceneException: Exception {
    override var reason: String {
        "Cannot determine the current window scene in which to present the modal for requesting a review."
    }
}

internal class MissingContainerURLException: Exception {
    override var reason: String {
        "Cannot determine the container URL."
    }
}


public class TargetLinksModule: Module {
    private static let isAppClip: Bool = {
      if let infoPlist = Bundle.main.infoDictionary, let _ = infoPlist["NSAppClip"] as? [String: Any] {
        return true
      }
      return false
    }()

    
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('TargetLinks')` in JavaScript.
    Name("TargetLinks")

      Constants([
        "isAppClip": TargetLinksModule.isAppClip
      ])

    // Display overlay to advertise full app
    // https://developer.apple.com/documentation/app_clips/recommending_your_app_to_app_clip_users
    AsyncFunction("openAppClipDisplay") {
        if #available(iOS 16, *) {
            guard let currentScene = UIApplication.shared.connectedScenes.first as? UIWindowScene else {
                throw MissingCurrentWindowSceneException()
            }

            let config = SKOverlay.AppClipConfiguration(position: .bottom)
            let overlay = SKOverlay(configuration: config)
            overlay.present(in: currentScene)
        }
    }.runOnQueue(DispatchQueue.main)

  }
}
