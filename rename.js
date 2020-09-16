/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const readline = require('readline')
/* eslint-enable @typescript-eslint/no-var-requires */

// Params used in the template project
const DEFAULT_NAME = 'react-native-module-template'
const DEFAULT_SHORT_NAME = 'RNModuleTemplate'
const DEFAULT_URL =
  'https://github.com/bc0nt13/react-native-module-template#readme'
const DEFAULT_GIT_URL =
  'https://github.com/bc0nt13/react-native-module-template.git'
const DEFAULT_AUTHOR_NAME = 'Bruno Conti'
const DEFAULT_AUTHOR_EMAIL = 'bruno.conti@taplabs.rocks'

// Questions list
const QUESTION_NAME = `Enter library name (use kebab-case) (default ${DEFAULT_NAME}): `
const QUESTION_SHORT_NAME = `Enter library short name (used to name ObjC and Java classes, use PascalCase) (default ${DEFAULT_SHORT_NAME}): `
const QUESTION_URL = `Enter library homepage (default ${DEFAULT_URL}): `
const QUESTION_GIT_URL = `Enter library git url (default ${DEFAULT_GIT_URL}): `
const QUESTION_AUTHOR_NAME = `Enter author name (default ${DEFAULT_AUTHOR_NAME}): `
const QUESTION_AUTHOR_EMAIL = `Enter author email (default ${DEFAULT_AUTHOR_EMAIL}): `

// Pass `js-only` parameter to remove native code
const jsOnly = process.argv.slice(2).includes('js-only')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

if (jsOnly) {
  // JS only mode
  // Remove `QUESTION_SHORT_NAME` since it is used only in the native code
  // Remove `QUESTION_GIT_URL` since in it used only in the .podspec file
  rl.question(QUESTION_NAME, (name) => {
    rl.question(QUESTION_URL, (url) => {
      rl.question(QUESTION_AUTHOR_NAME, (authorName) => {
        rl.question(QUESTION_AUTHOR_EMAIL, (authorEmail) => {
          renameFiles(
            name || undefined,
            undefined,
            url || undefined,
            undefined,
            authorName || undefined,
            authorEmail || undefined
          )
          rl.close()
        })
      })
    })
  })
} else {
  // Normal mode
  // All questions
  rl.question(QUESTION_NAME, (name) => {
    rl.question(QUESTION_SHORT_NAME, (shortName) => {
      rl.question(QUESTION_URL, (url) => {
        rl.question(QUESTION_GIT_URL, (gitUrl) => {
          rl.question(QUESTION_AUTHOR_NAME, (authorName) => {
            rl.question(QUESTION_AUTHOR_EMAIL, (authorEmail) => {
              renameFiles(
                name || undefined,
                shortName || undefined,
                url || undefined,
                gitUrl || undefined,
                authorName || undefined,
                authorEmail || undefined
              )
              rl.close()
            })
          })
        })
      })
    })
  })
}

const replaceDefaultShortName = (data, shortName) => {
  return data.replace(new RegExp(DEFAULT_SHORT_NAME, 'g'), shortName)
}

const renameFiles = (
  name = DEFAULT_NAME,
  shortName = DEFAULT_SHORT_NAME,
  url = DEFAULT_URL,
  gitUrl = DEFAULT_GIT_URL,
  authorName = DEFAULT_AUTHOR_NAME,
  authorEmail = DEFAULT_AUTHOR_EMAIL
) => {
  try {
    // Clear `README.md`
    fs.writeFileSync('README.md', '')

    if (jsOnly) {
      // JS only mode
      // Remove .podspec
      fs.unlinkSync(`${DEFAULT_NAME}.podspec`)
    } else {
      // Normal mode
      // Rename .podspec and replace git url
      fs.renameSync(`${DEFAULT_NAME}.podspec`, `${name}.podspec`)
      const podspecData = fs.readFileSync(`${name}.podspec`).toString()
      const newPodspecData = podspecData.replace(DEFAULT_GIT_URL, gitUrl)
      fs.writeFileSync(`${name}.podspec`, newPodspecData)
    }

    // Modify `package.json`
    const packageData = fs.readFileSync('package.json').toString()
    let newPackageData = packageData
      .replace(DEFAULT_URL, url)
      .replace(new RegExp(DEFAULT_NAME, 'g'), name)
      .replace(DEFAULT_AUTHOR_NAME, authorName)
      .replace(DEFAULT_AUTHOR_EMAIL, authorEmail)
      .replace(/"description": ".+"/g, '"description": ""')
      .replace(/"version": ".+"/g, '"version": "1.0.0"')
    if (jsOnly) {
      // JS only mode
      // Supply only `lib` folder in `package.json`
      newPackageData = newPackageData.replace(
        /"files": \[.+\],/s,
        '"files": [\n    "lib"\n  ],'
      )
    }
    fs.writeFileSync('package.json', newPackageData)

    // Modify author in `LICENSE`
    const licenseData = fs.readFileSync('LICENSE').toString()
    const newLicenseData = licenseData.replace(DEFAULT_AUTHOR_NAME, authorName)
    fs.writeFileSync('LICENSE', newLicenseData)

    // Modify example's `tsconfig.json`
    const tsConfigData = fs.readFileSync('example/tsconfig.json').toString()
    const newTsConfigData = tsConfigData.replace(DEFAULT_NAME, name)
    fs.writeFileSync('example/tsconfig.json', newTsConfigData)

    if (jsOnly) {
      // JS only mode
      // Remove native modules from `index.tsx`
      const indexData = fs.readFileSync('src/index.tsx').toString()
      const newIndexData = indexData
        .replace(
          new RegExp(
            `\nexport default NativeModules.${DEFAULT_SHORT_NAME}\n`,
            'g'
          ),
          ''
        )
        .replace('NativeModules, ', '')
      fs.writeFileSync('src/index.tsx', newIndexData)

      // Remove native modules from `App.tsx`
      const appData = fs.readFileSync('example/src/App.tsx').toString()
      const newAppData = appData
        .replace(`${DEFAULT_SHORT_NAME}, `, '')
        .replace(DEFAULT_SHORT_NAME, "''")
        .replace(DEFAULT_NAME, name)
      fs.writeFileSync('example/src/App.tsx', newAppData)

      // Remove native folders
      fs.rmdirSync('ios', { recursive: true })
      fs.rmdirSync('android', { recursive: true })
    } else {
      // Normal mode
      // Rename native modules in `index.tsx`
      const indexData = fs.readFileSync('src/index.tsx').toString()
      const newIndexData = replaceDefaultShortName(indexData, shortName)
      fs.writeFileSync('src/index.tsx', newIndexData)

      // Rename native modules in `App.tsx`
      const appData = fs.readFileSync('example/src/App.tsx').toString()
      const newAppData = replaceDefaultShortName(appData, shortName).replace(
        DEFAULT_NAME,
        name
      )
      fs.writeFileSync('example/src/App.tsx', newAppData)

      // Rename and modify .xcscheme file
      fs.renameSync(
        `ios/${DEFAULT_SHORT_NAME}.xcodeproj/xcshareddata/xcschemes/${DEFAULT_SHORT_NAME}.xcscheme`,
        `ios/${DEFAULT_SHORT_NAME}.xcodeproj/xcshareddata/xcschemes/${shortName}.xcscheme`
      )
      const schemeData = fs
        .readFileSync(
          `ios/${DEFAULT_SHORT_NAME}.xcodeproj/xcshareddata/xcschemes/${shortName}.xcscheme`
        )
        .toString()
      const newSchemeData = replaceDefaultShortName(schemeData, shortName)
      fs.writeFileSync(
        `ios/${DEFAULT_SHORT_NAME}.xcodeproj/xcshareddata/xcschemes/${shortName}.xcscheme`,
        newSchemeData
      )

      // Rename .xcodeproj folder
      fs.renameSync(
        `ios/${DEFAULT_SHORT_NAME}.xcodeproj`,
        `ios/${shortName}.xcodeproj`
      )

      // Modify `project.pbxproj`
      const projectData = fs
        .readFileSync(`ios/${shortName}.xcodeproj/project.pbxproj`)
        .toString()
      const newProjectData = replaceDefaultShortName(
        projectData,
        shortName
      ).replace(DEFAULT_AUTHOR_NAME, authorName)
      fs.writeFileSync(
        `ios/${shortName}.xcodeproj/project.pbxproj`,
        newProjectData
      )

      // Rename and modify bridging header .h file
      fs.renameSync(
        `ios/${DEFAULT_SHORT_NAME}-Bridging-Header.h`,
        `ios/${shortName}-Bridging-Header.h`
      )

      // Rename and modify .m file
      fs.renameSync(`ios/${DEFAULT_SHORT_NAME}.m`, `ios/${shortName}.m`)
      const implementationData = fs
        .readFileSync(`ios/${shortName}.m`)
        .toString()
      const newImplementationData = replaceDefaultShortName(
        implementationData,
        shortName
      ).replace(DEFAULT_AUTHOR_NAME, authorName)
      fs.writeFileSync(`ios/${shortName}.m`, newImplementationData)

      // Rename and modify .swift file
      fs.renameSync(`ios/${DEFAULT_SHORT_NAME}.swift`, `ios/${shortName}.swift`)
      const swiftData = fs.readFileSync(`ios/${shortName}.swift`).toString()
      const newSwiftData = replaceDefaultShortName(
        swiftData,
        shortName
      ).replace(DEFAULT_AUTHOR_NAME, authorName)
      fs.writeFileSync(`ios/${shortName}.swift`, newSwiftData)

      // Generate Android package name from auther and module names
      const androidPackageAuthorName = authorName
        .replace(/\s/g, '')
        .toLowerCase()
      const androidPackageModuleName = name.replace(/-/g, '').toLowerCase()
      const androidPackageName = `com.${androidPackageAuthorName}.${androidPackageModuleName}`

      // Generate current Android package name from default author and module names
      const defaultAndroidPackageAuthorName = DEFAULT_AUTHOR_NAME.replace(
        /\s/g,
        ''
      ).toLowerCase()
      const defaultAndroidPackageModuleName = DEFAULT_NAME.replace(
        /-/g,
        ''
      ).toLowerCase()
      const defaultAndroidPackageName = `com.${defaultAndroidPackageAuthorName}.${defaultAndroidPackageModuleName}`

      // Rename package in `AndroidManifest.xml`
      const manifestData = fs
        .readFileSync('android/src/main/AndroidManifest.xml')
        .toString()
      const newManifestData = manifestData.replace(
        defaultAndroidPackageName,
        androidPackageName
      )
      fs.writeFileSync('android/src/main/AndroidManifest.xml', newManifestData)

      // Rename package folders
      fs.renameSync(
        `android/src/main/java/com/${defaultAndroidPackageAuthorName}`,
        `android/src/main/java/com/${androidPackageAuthorName}`
      )
      fs.renameSync(
        `android/src/main/java/com/${androidPackageAuthorName}/${defaultAndroidPackageModuleName}`,
        `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}`
      )

      // Rename and modify Java files
      fs.renameSync(
        `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${DEFAULT_SHORT_NAME}Module.java`,
        `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${shortName}Module.java`
      )
      const javaModuleData = fs
        .readFileSync(
          `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${shortName}Module.java`
        )
        .toString()
      const newJavaModuleData = replaceDefaultShortName(
        javaModuleData,
        shortName
      ).replace(defaultAndroidPackageName, androidPackageName)
      fs.writeFileSync(
        `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${shortName}Module.java`,
        newJavaModuleData
      )
      fs.renameSync(
        `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${DEFAULT_SHORT_NAME}Package.java`,
        `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${shortName}Package.java`
      )
      const javaPackageData = fs
        .readFileSync(
          `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${shortName}Package.java`
        )
        .toString()
      const newJavaPackageData = replaceDefaultShortName(
        javaPackageData,
        shortName
      ).replace(defaultAndroidPackageName, androidPackageName)
      fs.writeFileSync(
        `android/src/main/java/com/${androidPackageAuthorName}/${androidPackageModuleName}/${shortName}Package.java`,
        newJavaPackageData
      )

      // Modify example's `project.pbxproj`
      const exampleProjectData = fs
        .readFileSync('example/ios/example.xcodeproj/project.pbxproj')
        .toString()
      const newExampleProjectData = replaceDefaultShortName(
        exampleProjectData,
        shortName
      )
      fs.writeFileSync(
        'example/ios/example.xcodeproj/project.pbxproj',
        newExampleProjectData
      )

      // Modify `settings.gradle`
      const settingsData = fs
        .readFileSync('example/android/settings.gradle')
        .toString()
      const newSettingsData = settingsData.replace(
        new RegExp(DEFAULT_NAME, 'g'),
        name
      )
      fs.writeFileSync('example/android/settings.gradle', newSettingsData)

      // Modify `build.gradle`
      const buildData = fs
        .readFileSync('example/android/app/build.gradle')
        .toString()
      const newBuildData = buildData.replace(
        new RegExp(DEFAULT_NAME, 'g'),
        name
      )
      fs.writeFileSync('example/android/app/build.gradle', newBuildData)

      // Modify `MainApplication.java`
      const mainApplicationData = fs
        .readFileSync(
          'example/android/app/src/main/java/com/example/MainApplication.java'
        )
        .toString()
      const newMainApplicationData = replaceDefaultShortName(
        mainApplicationData,
        shortName
      ).replace(defaultAndroidPackageName, androidPackageName)
      fs.writeFileSync(
        'example/android/app/src/main/java/com/example/MainApplication.java',
        newMainApplicationData
      )
    }
  } catch (err) {
    console.log(err)
  }
}
