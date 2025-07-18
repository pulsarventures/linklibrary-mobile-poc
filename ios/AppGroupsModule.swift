import Foundation

@objc(AppGroupsModule)
class AppGroupsModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func getSharedContent(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let appGroupId = "group.com.linklibrary.share"
        
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group", nil)
            return
        }
        
        guard let sharedData = userDefaults.object(forKey: "SharedData") as? [String: Any] else {
            resolve(nil)
            return
        }
        
        // Clear the shared content after reading
        userDefaults.removeObject(forKey: "SharedData")
        userDefaults.synchronize()
        
        resolve(sharedData)
    }
    
    @objc
    func clearSharedContent(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let appGroupId = "group.com.linklibrary.share"
        
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("APP_GROUP_ERROR", "Failed to access App Group", nil)
            return
        }
        
        userDefaults.removeObject(forKey: "SharedData")
        userDefaults.synchronize()
        
        resolve(true)
    }
}
