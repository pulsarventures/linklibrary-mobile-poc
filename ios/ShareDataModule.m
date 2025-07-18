#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ShareDataModule, NSObject)

RCT_EXTERN_METHOD(getSharedData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end 