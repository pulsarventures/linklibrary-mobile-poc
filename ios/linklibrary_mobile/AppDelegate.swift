import UIKit

@UIApplicationMain
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    self.moduleName = "linklibrary_mobile"
    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    var sourceURL: URL?
    #if DEBUG
      sourceURL = URL(string: "http://localhost:8081/index.bundle?platform=ios")
    #endif
    
    if let url = sourceURL {
      self.bundleURL = url
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge!) -> URL! {
    #if DEBUG
      return URL(string: "http://localhost:8081/index.bundle?platform=ios")
    #else
      return super.sourceURL(for: bridge)
    #endif
  }
} 