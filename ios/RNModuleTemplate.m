//
//  RNModuleTemplate.m
//  RNModuleTemplate
//
//  Copyright © 2020 Bruno Conti. All rights reserved.
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
