import Foundation
import React

@objc(ShareNotificationModule)
class ShareNotificationModule: RCTEventEmitter {
  
  public static var shared: ShareNotificationModule?
  
  override init() {
    super.init()
    ShareNotificationModule.shared = self
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  override func supportedEvents() -> [String]! {
    return ["SharedURLReceived"]
  }
  
  @objc
  func sendSharedURL(_ url: String) {
    sendEvent(withName: "SharedURLReceived", body: url)
  }
}