import Foundation

// Manual RCT type definitions to avoid import issues
typealias RCTPromiseResolveBlock = (Any?) -> Void
typealias RCTPromiseRejectBlock = (String?, String?, Error?) -> Void

@objc(AppGroupsModule)
class AppGroupsModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func getSharedContent(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let appGroupId = "group.com.pulsarventures.linklibraryai"
        
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group", nil)
            return
        }
        
        guard let sharedData = userDefaults.object(forKey: "SharedData") as? [String: Any] else {
            resolve(nil)
            return
        }
        
        // Don't clear immediately - let the app decide when to clear
        // This prevents issues with multiple reads
        // userDefaults.removeObject(forKey: "SharedData")
        // userDefaults.synchronize()
        
        resolve(sharedData)
    }
    
    @objc
    func clearSharedContent(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let appGroupId = "group.com.pulsarventures.linklibraryai"
        
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group", nil)
            return
        }
        
        userDefaults.removeObject(forKey: "SharedData")
        userDefaults.synchronize()
        
        resolve(true)
    }
    
    @objc
    func testSaveSharedContent(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let appGroupId = "group.com.pulsarventures.linklibraryai"
        
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group", nil)
            return
        }
        
        // Save test data
        let testData: [String: Any] = ["type": "url", "data": "https://test.com"]
        userDefaults.set(testData, forKey: "SharedData")
        userDefaults.synchronize()
        
        resolve(true)
    }
}
