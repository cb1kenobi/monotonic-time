{
	'targets': [
		{
			'target_name': 'monotonic-time',
			'sources': [
				'src/binding/binding.cpp',
			],
			'cflags!': [ '-fno-exceptions', '-std=c++17' ],
			'cflags_cc!': [ '-fno-exceptions', '-std=c++17' ],
			'cflags_cc': [
				'-std=c++20',
				'-fexceptions'
			],
			'conditions': [
				['OS=="win"', {
					'link_settings': {
						'libraries': [
							'rpcrt4.lib',
							'shell32.lib',
							'shlwapi.lib'
						]
					},
					'msvs_settings': {
						'VCCLCompilerTool': {
							'ExceptionHandling': 1,
							'AdditionalOptions!': ['/Zc:__cplusplus', '-std:c++17'],
							'AdditionalOptions': ['/Zc:__cplusplus', '/std:c++20']
						},
						'VCLinkerTool': {
							'LinkTimeCodeGeneration': 1,
							'LinkIncremental': 1
						}
					}
				}],
				['OS=="linux" or OS=="mac"', {
					'cflags+': ['-fexceptions'],
					'cflags_cc+': ['-fexceptions'],
					'xcode_settings': {
						'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
					}
				}]
			],
			'configurations': {
				'Release': {
					# 'defines': ['DEBUG'],
					'msvs_settings': {
						'VCCLCompilerTool': {
							'RuntimeLibrary': 2,
							'ExceptionHandling': 1,
							'AdditionalOptions!': [],
							'AdditionalOptions': ['/Zc:__cplusplus', '/std:c++20']
						}
					}
				},
				'Debug': {
					'cflags_cc+': ['-g', '--coverage'],
					'defines': ['DEBUG'],
					'ldflags': ['--coverage'],
					'msvs_settings': {
						'VCCLCompilerTool': {
							# 'RuntimeLibrary': 3,
							'RuntimeLibrary': 2,
							'ExceptionHandling': 1,
							'AdditionalOptions!': [],
							# 'AdditionalOptions': ['/Zc:__cplusplus', '/std:c++20']
							'AdditionalOptions': ['/Zc:__cplusplus', '/std:c++20', '/U_DEBUG']
						}
					},
					'xcode_settings': {
						'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
						'OTHER_CFLAGS': ['-g', '--coverage'],
						'OTHER_LDFLAGS': ['--coverage']
					}
				}
			}
		}
	]
}
