import Foundation
import React

@objc(ShareDataModule)
class ShareDataModule: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc(getSharedData:rejecter:)
  func getSharedData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    print("📤 ShareDataModule: getSharedData called")
    
    guard let userDefaults = UserDefaults(suiteName: "group.com.pulsarventures.linklibrary.ai") else {
      print("📤 ShareDataModule: Failed to access App Group UserDefaults")
      resolve(nil)
      return
    }
    
    // Check for shared URL
    if let sharedUrl = userDefaults.string(forKey: "sharedUrl") {
      print("📤 ShareDataModule: Found shared URL:", sharedUrl)
      userDefaults.removeObject(forKey: "sharedUrl") // Clear after reading
      resolve([
        "type": "url",
        "data": sharedUrl
      ])
      return
    }
    
    // Check for shared text
    if let sharedText = userDefaults.string(forKey: "sharedText") {
      print("📤 ShareDataModule: Found shared text:", sharedText)
      userDefaults.removeObject(forKey: "sharedText") // Clear after reading
      resolve([
        "type": "text",
        "data": sharedText
      ])
      return
    }
    
    print("📤 ShareDataModule: No shared data found")
    resolve(nil)
  }
} 