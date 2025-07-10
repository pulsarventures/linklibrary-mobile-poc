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
                self.saveSharedData(["type": "url", "data": shareURL.absoluteString])
            }
            self.closeExtension()
        }
    }
    
    func handleText(itemProvider: NSItemProvider) {
        itemProvider.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { (text, error) in
            if let shareText = text as? String {
                self.saveSharedData(["type": "text", "data": shareText])
            }
            self.closeExtension()
        }
    }
    
    func saveSharedData(_ data: [String: Any]) {
        let userDefaults = UserDefaults(suiteName: "group.com.linklibraryai.shared")
        userDefaults?.set(data, forKey: "SharedData")
        userDefaults?.synchronize()
    }
    
    func closeExtension() {
        DispatchQueue.main.async {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
}
