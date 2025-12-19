//
//  ActionViewController.swift
//  ActionExtension
//
//  Created by iMac on 17/12/25.
//  Copyright © 2025 Pulsar Ventures LLC. All rights reserved.
//

import UIKit
import MobileCoreServices
import UniformTypeIdentifiers
import LinkPresentation
import Security

class ActionViewController: UIViewController {

    @IBOutlet weak var actionView: UIStackView!
    @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var lblText:UILabel!
    
    @IBOutlet weak var txtTitle: UITextField!
    @IBOutlet weak var lblUrl: UILabel!
    @IBOutlet weak var txtUrl: UITextField!
    @IBOutlet weak var lblSummary: UILabel!
    @IBOutlet weak var txtSummary: UITextField!
    @IBOutlet weak var txtNote: UITextField!
    @IBOutlet weak var btnAdd: UIButton!
  @IBOutlet weak var loader: UIActivityIndicatorView!
  var strType = "url"
    override func viewDidLoad() {
        super.viewDidLoad()
        actionView.isHidden = true
        loader.isHidden = false
        loader.startAnimating()
        handleSharedContent()
    }
  
  func fetchLinkMetadata(
      url: URL,
      completion: @escaping ([String: Any]) -> Void
  ) {
      let provider = LPMetadataProvider()

      provider.startFetchingMetadata(for: url) { metadata, error in
          var result: [String: Any] = [
              "url": url.absoluteString
          ]

          if let title = metadata?.title {
              result["title"] = title
          }

          if let originalURL = metadata?.originalURL {
              result["originalUrl"] = originalURL.absoluteString
          }

          DispatchQueue.main.async {
              completion(result)
          }
      }
  }


  
  func handleSharedContent() {
      guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
            let itemProvider = extensionItem.attachments?.first else {
          closeExtension()
          return
      }
      
      if itemProvider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
        handleSharedURL(itemProvider: itemProvider)
      } else if itemProvider.hasItemConformingToTypeIdentifier(UTType.text.identifier) {
          handleText(itemProvider: itemProvider)
      } else {
          closeExtension()
      }
  }

  func handleSharedURL(itemProvider: NSItemProvider) {
      itemProvider.loadItem(
          forTypeIdentifier: UTType.url.identifier,
          options: nil
      ) { url, error in

          guard let shareURL = url as? URL else {
              self.closeExtension()
              return
          }

          self.fetchLinkMetadata(url: shareURL) { metadata in
              // ✅ UI UPDATE — MAIN THREAD GUARANTEED
              self.txtUrl.text = shareURL.absoluteString

              if let title = metadata["title"] as? String {
                  self.txtTitle.text = title
              } else {
                  self.txtTitle.text = ""
              }
            self.strType = "url"
              print("✅ Metadata:", metadata)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
              self.actionView.isHidden = false
              self.loader.isHidden = true
              self.loader.stopAnimating()
            }
          }
      }
  }
  
  func handleText(itemProvider: NSItemProvider) {
      itemProvider.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { (text, error) in
          if let shareText = text as? String {
              print("ShareViewController: Processing text: \(shareText)")
//              self.saveSharedData(["type": "text", "data": shareText,"isFromAction": true])
            self.strType = "text"
              // Small delay to ensure data i s saved
              DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.actionView.isHidden = false
                self.loader.isHidden = true
                self.loader.stopAnimating()
//                  self.openMainApp()
//                  // Close extension after attempting to open app
//                  DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
//                      self.closeExtension()
//                  }
              }
          } else {
              self.closeExtension()
          }
      }
  }
    @IBAction func doneTapped(_ sender: Any) {
      self.closeExtension()
    }
    
    @IBAction func btnAddClicked(_ sender: Any) {
//      guard let title = txtTitle.text,
//                let url = txtUrl.text else { return }
//
//          let payload: [String: Any] = [
//              "title": title,
//              "url": url,
//              "summary": txtSummary.text ?? "",
//              "notes": txtNote.text ?? "",
//              "input_source": "mobile",
//              "collection_id": "1372",
//              "is_favorite": false,
//              "tag_ids": []
//          ]
//          startLoading()
//          callAddLinkAPI(payload: payload)
      let title = txtTitle.text
      let url = txtUrl.text
      self.saveSharedData([
          "type": strType,
          "data": url,
          "title": title ?? "",
//          "summary": txtSummary.text ?? "",
          "notes": txtNote.text ?? "",
          "isFromAction": true
      ])
      self.closeExtension()
//      let token = getTokenFromKeychain()
//      print("🔐 Token:", token ?? "nil")
//      self.showAlert(title: "Token", message: token ?? "nil")
    }
    
  func callAddLinkAPI(payload: [String: Any]) {
      guard let apiURL = URL(string: "https://api.linklibrary.ai/api/v1/links") else { return }
    let defaults = UserDefaults(suiteName: "group.com.pulsarventures.linklibrary.ai")
    let token = defaults?.string(forKey: "token") ?? "no"
    self.showAlert(title: "token", message: token)
      var request = URLRequest(url: apiURL)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = try? JSONSerialization.data(withJSONObject: payload)

      let task = URLSession.shared.dataTask(with: request) { data, response, error in
          DispatchQueue.main.async {
              if error != nil {
                  print("❌ API error")
                self.showAlert(title: "Error", message: error!.localizedDescription)
                  return
              }
            else{
              self.stopLoading()
              self.showAlert(title: "Saved", message: "Link added successfully") {
                                  self.extensionContext?.completeRequest(returningItems: nil)
                              }
            }
              print("✅ Link added successfully")
//              self.closeExtension()
          }
      }
      task.resume()
  }

  // MARK: - Alert
      func showAlert(title: String, message: String, completion: (() -> Void)? = nil) {
          let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
          alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
              completion?()
          })
          present(alert, animated: true)
      }
  
    func saveSharedData(_ data: [String: Any]) {
    enum AppGroup: String {
      case share = "group.com.pulsarventures.linklibrary.ai"
      case analytics = "group.com.pulsarventures.linklibrary.ai.actionshare"
    }
    
      print("ShareViewController: Saving shared data: \(data)")
      let userDefaults = UserDefaults(suiteName: AppGroup.share.rawValue)
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
  
  func startLoading() {
    loader.isHidden = false
      loader.startAnimating()
    btnAdd.isEnabled = false
  }

  func stopLoading() {
    loader.isHidden = true
      loader.stopAnimating()
    btnAdd.isEnabled = true
  }
  
  func getTokenFromKeychain() -> String? {
      let accessGroup = "group.com.pulsarventures.linklibrary.ai"

      let query: [String: Any] = [
          kSecClass as String: kSecClassGenericPassword,
          kSecAttrService as String: "com.linklibrary.auth",
          kSecAttrAccount as String: "token_data",
          kSecAttrAccessGroup as String: accessGroup,
          kSecReturnData as String: true,
          kSecMatchLimit as String: kSecMatchLimitOne
      ]

      var item: CFTypeRef?
      let status = SecItemCopyMatching(query as CFDictionary, &item)

      if status == errSecSuccess,
         let data = item as? Data {
          return String(data: data, encoding: .utf8)
      }

      return nil
  }
  
}
