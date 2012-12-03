//	---------------------------------------------------------------------------
//	jWebSocket FileSystem, Client PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Filesystem Client Plug-In
//	---------------------------------------------------------------------------

jws.FileSystemPlugIn = {

	// namespace for filesystem plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.filesystem",
	
	// core aliases
	ALIAS_PRIVATE: "privateDir",
	ALIAS_PUBLIC: "publicDir",

	NOT_FOUND_ERR: 1,
	SECURITY_ERR: 2,
	ABORT_ERR: 3,
	NOT_READABLE_ERR: 4,
	ENCODING_ERR: 5,
	NO_MODIFICATION_ALLOWED_ERR: 6,
	INVALID_STATE_ERR: 7,
	SYNTAX_ERR: 8,
	INVALID_MODIFICATION_ERR: 9,
	QUOTA_EXCEEDED_ERR: 10,
	TYPE_MISMATCH_ERR: 11,
	PATH_EXISTS_ERR: 12,

	processToken: function( aToken ) {
		// check if namespace matches
		if( aToken.ns == jws.FileSystemPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "load" == aToken.reqType ) {
				if( aToken.code == 0 ) {
					if (aToken.decode){
						aToken.data = Base64.decode( aToken.data );
					}
					if( this.OnFileLoaded ) {
						this.OnFileLoaded( aToken );
					}
				} else {
					if( this.OnFileError ) {
						this.OnFileError( aToken );
					}
				}
			} else if( "send" == aToken.reqType ) {
				if( aToken.code == 0 ) {
					if( this.OnFileSent ) {
						this.OnFileSent( aToken );
					}
				} else {
					if( this.OnFileError ) {
						this.OnFileError( aToken );
					}
				}
			} else if( "event" == aToken.type ) {
				if( "filesaved" == aToken.name ) {
					if( this.OnFileSaved ) {
						this.OnFileSaved( aToken );
					}
				} else if( "filereceived" == aToken.name ) {
					
					if( this.OnFileReceived ) {
						this.OnFileReceived( aToken );
					}
				}
			}
		}
	},

	//:m:*:fileGetFilelist
	//:d:en:Retrieves the file list from a given alias
	//:a:en::aAlias:String:The alias value. <tt>Example: privateDir</tt>
	//:a:en::aFilemasks:Array:The filtering filemasks. <tt>Example: ["txt"]</tt>
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.recursive:Boolean:Recursive file listing flag. Default value is FALSE
	//:r:*:::void:none
	fileGetFilelist: function( aAlias, aFilemasks, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lRecursive = false;

			if( aOptions ) {
				if( aOptions.recursive != undefined ) {
					lRecursive = aOptions.recursive;
				}
			}
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "getFilelist",
				alias: aAlias,
				recursive: lRecursive,
				filemasks: aFilemasks
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:fileDelete
	//:d:en:Deletes a file in the user private scope.
	//:a:en::aFilename:String:The filename value.
	//:a:en::aForce:Boolean:Force file delete flag.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	fileDelete: function( aFilename, aForce, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "delete",
				filename: aFilename,
				force: aForce
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},
	
	//:m:*:fileExists
	//:d:en:Indicates if a custom file exists on a given alias
	//:a:en::aAlias:String:The alias value. <tt>Example: privateDir</tt>
	//:a:en::aFilename:String:The filename value
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:r:*:::void:none
	fileExists: function( aAlias, aFilename, aOptions ) {
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "exists",
				filename: aFilename,
				alias: aAlias
			};
			this.sendToken( lToken,	aOptions );
		}	
		return lRes;
	},

	//:m:*:fileLoad
	//:d:en:Loads a file from a given alias
	//:a:en::aFilename:String:The filename value
	//:a:en::aAlias:String:The alias value. <tt>Example: privateDir</tt>
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.decode:Boolean:Indicates if the received file content should be "base64" decoded automatically.
	//:r:*:::void:none
	fileLoad: function( aFilename, aAlias, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "load",
				alias: aAlias,
				filename: aFilename,
				decode: (aOptions.decode) || false
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:fileSave
	//:d:en:Saves a file in a given scope
	//:a:en::aFilename:String:The filename value
	//:a:en::aData:String:The file content. Could be base64 encoded optionally.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.scope:String:The scope value. <tt>Example: jws.SCOPE_PRIVATE</tt>
	//:a:en::aOptions.encode:Boolean:Indicates if the file content require to be encoded internally before send. Default value is TRUE.
	//:a:en::aOptions.notify:Boolean:Indicates if the server should notify the file save to connected clients. Default value is FALSE.
	//:a:en::aOptions.encoding:String:The encoding method. Currently "base64" is only supported and enabled by default.
	//:r:*:::void:none
	fileSave: function( aFilename, aData, aOptions ) {
		var lRes = this.createDefaultResult();
		var lEncoding = "base64";
		var lEncode = true;
		var lNotify = false;
		var lScope = jws.SCOPE_PRIVATE;
		if( aOptions ) {
			if( aOptions.scope != undefined ) {
				lScope = aOptions.scope;
			}
			if( aOptions.encode != undefined ) {
				lEncode = aOptions.encode;
			}
			if( aOptions.encoding != undefined ) {
				lEncoding = aOptions.encoding;
			}
			if( aOptions.encode != undefined ) {
				lEncode = aOptions.encode;
			}
			if( aOptions.notify != undefined ) {
				// notify only is the scope is public
				lNotify = (jws.SCOPE_PUBLIC == lScope) && aOptions.notify;
			}
		}
		if( lEncode ) {
			if( lEncoding == "base64" ) {
				aData = Base64.encode( aData );
			}
		}
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "save",
				scope: lScope,
				encoding: lEncoding,
				notify: lNotify,
				data: aData,
				filename: aFilename
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:fileSend
	//:d:en:Sends a file to a targeted client
	//:a:en::aTargetId:String:The targeted client identifier
	//:a:en::aFilename:String:The filename value
	//:a:en::aData:Object:The file content. Could be encoded optionally.
	//:a:en::aOptions:Object:Optional arguments for the raw client sendToken method.
	//:a:en::aOptions.encoding:String:The encoding method. Default value is "base64"
	//:r:*:::void:none
	fileSend: function( aTargetId, aFilename, aData, aOptions ) {
		var lIsNode = false;
		var lEncoding = "base64";
		
		if( aOptions ) {
			lEncoding = aOptions["encoding"] || "base64";
			
			if( aOptions.isNode != undefined ) {
				lIsNode = aOptions.isNode;
			}
		}
		var lRes = this.checkConnected();
		if( 0 == lRes.code ) {
			var lToken = {
				ns: jws.FileSystemPlugIn.NS,
				type: "send",
				data: aData,
				encoding: lEncoding,
				filename: aFilename
			};
			if( lIsNode ) {
				lToken.unid = aTargetId;
			} else {
				lToken.targetId = aTargetId;				
			}
			
			this.sendToken( lToken, aOptions);
		}
		return lRes;
	},

	fileGetErrorMsg: function( aCode ) {
		var lMsg = "unkown";
		switch( aCode ) {
			case jws.FileSystemPlugIn.NOT_FOUND_ERR: {
				lMsg = "NOT_FOUND_ERR";
				break;
			}
			case jws.FileSystemPlugIn.SECURITY_ERR: {
				lMsg = "SECURITY_ERR";
				break;
			}
			case jws.FileSystemPlugIn.ABORT_ERR: {
				lMsg = "ABORT_ERR";
				break;
			}
			case jws.FileSystemPlugIn.NOT_READABLE_ERR: {
				lMsg = "NOT_READABLE_ERR";
				break;
			}
			case jws.FileSystemPlugIn.ENCODING_ERR: {
				lMsg = "ENCODING_ERR";
				break;
			}
			case jws.FileSystemPlugIn.NO_MODIFICATION_ALLOWED_ERR: {
				lMsg = "NO_MODIFICATION_ALLOWED_ERR";
				break;
			}
			case jws.FileSystemPlugIn.INVALID_STATE_ERR: {
				lMsg = "INVALID_STATE_ERR";
				break;
			}
			case jws.FileSystemPlugIn.SYNTAX_ERR: {
				lMsg = "SYNTAX_ERR";
				break;
			}
			case jws.FileSystemPlugIn.INVALID_MODIFICATION_ERR: {
				lMsg = "INVALID_MODIFICATION_ERR";
				break;
			}
			case jws.FileSystemPlugIn.QUOTA_EXCEEDED_ERR: {
				lMsg = "QUOTA_EXCEEDED_ERR";
				break;
			}
			case jws.FileSystemPlugIn.TYPE_MISMATCH_ERR: {
				lMsg = "TYPE_MISMATCH_ERR";
				break;
			}
			case jws.FileSystemPlugIn.PATH_EXISTS_ERR: {
				lMsg = "PATH_EXISTS_ERR";
				break;
			}
		}
		return lMsg;
	},

	//:author:*:Unni Vemanchery Mana:2011-02-17:Incorporated image processing capabilities.
	//:m:*:fileLoadLocal
	//:d:en:This is a call back method which gets the number of files selected from the user.
	//:d:en:Construts a FileReader object that is specified in HTML 5 specification
	//:d:en:and calls its readAsDataURL with the filename obeject and reads the
	//:d:en:file content in Base64 encoded string.
	//:a:en::aDOMElem:Object:File Selection event object.
	//:a:en::aOptions:Object:Contains success and failure callbacks to control the files load
	//:a:en::aOptions.OnSuccess:Function:Called when a file has been loaded successfully
	//:a:en::aOptions.OnFailure:Function:Called when an error occur during the file load process
	//:r:*:::void:none
	fileLoadLocal: function( aDOMElem, aOptions ) {
		// to locally load a file no check for websocket connection is required
		var lRes = {
			code: 0,
			msg: "ok"
		};
		// check if the file upload element exists at all
		if( !aDOMElem || !aDOMElem.files ) {
			// TODO: Think about error message here!
			return {
				code: -1,
				msg: "No input file element passed."
			};
		}
		// check if the browser already supports the HTML5 File API
		if( undefined == window.FileReader ) {
			return {
				code: -1,
				msg: "Your browser does not yet support the HTML5 File API."
			};
		}
		// create options if not passed (eg. encoding)
		if( !aOptions ) {
			aOptions = {};
		}
		
		// settign the encoding method. "base64" only supported already.
		aOptions.encoding = "base64";
		
		// iterate through list of files
		var lFileList = aDOMElem.files;
		if( !lFileList || !lFileList.length ) {
			return {
				code: -1,
				msg: "No files selected."
			};
		}
		for( var lIdx = 0, lCnt = lFileList.length; lIdx < lCnt; lIdx++ ) {
			var lFile = lFileList[ lIdx ]
			var lReader = new FileReader();
			var lThis = this;

			// if file is completely loaded, fire OnLocalFileRead event
			lReader.onload = (function( aFile ) {
				return function( aEvent ) {
					if( lThis.OnLocalFileRead || aOptions.OnSuccess) {
						var lToken = {
							encoding: aOptions.encoding,
							fileName: ( aFile.fileName ? aFile.fileName : aFile.name ),
							fileSize: ( aFile.fileSize ? aFile.fileSize : aFile.size ),
							type: aFile.type,
							lastModified: aFile.lastModifiedDate,
							data: aEvent.target.result
						};
						if( aOptions.args ) {
							lToken.args = aOptions.args;
						}
						if( aOptions.action ) {
							lToken.action = aOptions.action;
						}
					}
					if( lThis.OnLocalFileRead ) {
						lThis.OnLocalFileRead( lToken );
					}
					if( aOptions.OnSuccess ) {
						aOptions.OnSuccess( lToken );
					}
				}
			})( lFile );

			// if any error appears fire OnLocalFileError event
			lReader.onerror = (function( aFile ) {
				return function( aEvent ) {
					if( lThis.OnLocalFileError || aOptions.OnFailure ) {
						// TODO: force error case and fill token
						var lCode = aEvent.target.error.code;
						var lToken = {
							code: lCode,
							msg: lThis.fileGetErrorMsg( lCode )
						};
						if( aOptions.args ) {
							lToken.args = aOptions.args;
						}
						if( aOptions.action ) {
							lToken.action = aOptions.action;
						}
					}
					if( lThis.OnLocalFileError ) {
						lThis.OnLocalFileError( lToken );
					}
					if( aOptions.OnFailure ) {
						aOptions.OnFailure( lToken );
					}
				}
			})( lFile );

			// and finally read the file(s)
			try{
				lReader.readAsDataURL( lFile );
			} catch( lEx ) {
				if( lThis.OnLocalFileError || aOptions.OnFailure ) {
					var lToken = {
						code: -1,
						msg: lEx.message
					};
					if( aOptions.args ) {
						lToken.args = aOptions.args;
					}
					if( aOptions.action ) {
						lToken.action = aOptions.action;
					}
				}
				if( lThis.OnLocalFileError ) {
					lThis.OnLocalFileError( lToken );
				}
				if( aOptions.OnFailure ) {
					aOptions.OnFailure( lToken );
				}
			}
		}
		return lRes;
	},

	//:m:*:setFileSystemCallbacks
	//:d:en:Sets the file-system plug-in lifecycle callbacks
	//:a:en::aListeners:Object:JSONObject containing the filesystem lifecycle callbacks
	//:a:en::aListeners.OnFileLoaded:Function:Called when a file has been loaded
	//:a:en::aListeners.OnFileSaved:Function:Called when a file has been saved
	//:a:en::aListeners.OnFileReceived:Function:Called when a file has been received from other client
	//:a:en::aListeners.OnFileSent:Function:Called when a file has been sent to other client
	//:a:en::aListeners.OnFileError:Function:Called when an error occur during the file-system lifecycle
	//:a:en::aListeners.OnLocalFileRead:Function:Called when a file has been read locally
	//:a:en::aListeners.OnLocalFileError:Function:Called when an error occur during a local file load
	//:r:*:::void:none
	setFileSystemCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnFileLoaded !== undefined ) {
			this.OnFileLoaded = aListeners.OnFileLoaded;
		}
		if( aListeners.OnFileSaved !== undefined ) {
			this.OnFileSaved = aListeners.OnFileSaved;
		}
		if( aListeners.OnFileReceived !== undefined ) {
			this.OnFileReceived = aListeners.OnFileReceived;
		}
		if( aListeners.OnFileSent !== undefined ) {
			this.OnFileSent = aListeners.OnFileSent;
		}
		if( aListeners.OnFileError !== undefined ) {
			this.OnFileError = aListeners.OnFileError;
		}
		if( aListeners.OnLocalFileRead !== undefined ) {
			this.OnLocalFileRead = aListeners.OnLocalFileRead;
		}
		if( aListeners.OnLocalFileError !== undefined ) {
			this.OnLocalFileError = aListeners.OnLocalFileError;
		}
	}

}

// add the jWebSocket FileSystem PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.FileSystemPlugIn );
