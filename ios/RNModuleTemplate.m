//
//  RNModuleTemplate.m
//  RNModuleTemplate
//
//  Created by Bruno Conti on 01/11/2019.
//  Copyright © 2019 Bruno Conti. All rights reserved.
//

#import "RNModuleTemplate.h"

@implementation RNModuleTemplate

RCT_EXPORT_MODULE();

+ (void)hello {}

- (NSDictionary *)constantsToExport
{
  return @{ @"count": @1 };
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
