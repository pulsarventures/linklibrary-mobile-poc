//
//  ShareViewController.swift
//  ShareExtension
//
//  Created by Balaji Nagisetty on 07.07.25.
//

import UIKit
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        print("ShareViewController: viewDidLoad called")
        handleSharedContent()
    }
    
    func handleSharedContent() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else {
            closeExtension()
            return
        }
        
        if itemProvider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
            handleURL(itemProvider: itemProvider)
        } else if itemProvider.hasItemConformingToTypeIdentifier(UTType.text.identifier) {
            handleText(itemProvider: itemProvider)
        } else {
            closeExtension()
        }
    }
    
    func handleURL(itemProvider: NSItemProvider) {
        itemProvider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (url, error) in
            if let shareURL = url as? URL {
                print("ShareViewController: Processing URL: \(shareURL.absoluteString)")
                self.saveSharedData(["type": "url", "data": shareURL.absoluteString])
                
                // Small delay to ensure data is saved
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.openMainApp()
                    // Close extension after attempting to open app
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self.closeExtension()
                    }
                }
            } else {
                self.closeExtension()
            }
        }
    }
    
    func handleText(itemProvider: NSItemProvider) {
        itemProvider.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { (text, error) in
            if let shareText = text as? String {
                print("ShareViewController: Processing text: \(shareText)")
                self.saveSharedData(["type": "text", "data": shareText])
                
                // Small delay to ensure data is saved
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.openMainApp()
                    // Close extension after attempting to open app
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self.closeExtension()
                    }
                }
            } else {
                self.closeExtension()
            }
        }
    }
    
    func saveSharedData(_ data: [String: Any]) {
        print("ShareViewController: Saving shared data: \(data)")
        let userDefaults = UserDefaults(suiteName: "group.com.pulsarventures.linklibraryai")
        userDefaults?.set(data, forKey: "SharedData")
        userDefaults?.synchronize()
        print("ShareViewController: Data saved successfully")
    }
    
    func openMainApp() {
        // Try multiple methods to open the main app
        let urlString = "linklibrarymobile://share"
        
        if let url = URL(string: urlString) {
            // Method 1: Try extensionContext first
            extensionContext?.open(url) { success in
                print("ShareViewController: extensionContext open result: \(success)")
                
                // For share extensions, even if this returns false, 
                // iOS might still open the app. Let's try both approaches.
                
                // Method 2: Try direct URL opening
                DispatchQueue.main.async {
                    if let appUrl = URL(string: urlString) {
                        // Try to find UIApplication in the responder chain
                        var responder: UIResponder? = self
                        while responder != nil {
                            if let application = responder as? UIApplication {
                                print("ShareViewController: Found UIApplication, attempting to open...")
                                application.open(appUrl, options: [:], completionHandler: { success in
                                    print("ShareViewController: UIApplication open result: \(success)")
                                })
                                return
                            }
                            responder = responder?.next
                        }
                        
                        // If we can't find UIApplication, try the selector method
                        print("ShareViewController: Trying selector method...")
                        let selector = NSSelectorFromString("openURL:")
                        var selectorResponder: UIResponder? = self
                        while selectorResponder != nil {
                            if selectorResponder?.responds(to: selector) == true {
                                selectorResponder?.perform(selector, with: appUrl)
                                print("ShareViewController: Selector method executed")
                                return
                            }
                            selectorResponder = selectorResponder?.next
                        }
                    }
                }
            }
        }
    }
    
    func closeExtension() {
        DispatchQueue.main.async {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
}
