//
//  RNModuleTemplate.swift
//  RNModuleTemplate
//
//  Copyright © 2020 Bruno Conti. All rights reserved.
//

import Foundation

@objc(RNModuleTemplate)
class RNModuleTemplate: NSObject {
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
