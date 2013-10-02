
/********************************************************************/
/*                                                                  */
/*  Copyright (c) 2005-2011 DAMIANI                                 */
/*                                                                  */
/*  This obfuscated code was created by Jasob 4.0 Trial Version.    */
/*  The code may be used for evaluation purposes only.              */
/*  To obtain full rights to the obfuscated code you have to        */
/*  purchase the license key (http://www.jasob.com/Purchase.html).  */
/*                                                                  */
/********************************************************************/


//	---------------------------------------------------------------------------
//	jWebSocket Enterprise Filesystem Client Plug-In
//	(C) Copyright 2012-2013 Innotrade GmbH, Herzogenrath Germany
//	Author: Rolando Santamaria Maso
//	---------------------------------------------------------------------------
jws.FileSystemPlugIn={NS:jws.NS_BASE+".plugins.filesystem",ALIAS_PRIVATE:"privateDir",ALIAS_PUBLIC:"publicDir",processToken:function(aToken){if(aToken.ns==jws.FileSystemPlugIn.NS){if("loadByChunks"==aToken.reqType){if(aToken.code==0){if(this.OnChunkLoaded){this.OnChunkLoaded(aToken);}}}else if("event"==aToken.type){if("fsdcreated"==aToken.name){if(this.OnFSDirectoryCreated){this.OnFSDirectoryCreated(aToken);}}else if("fsdchanged"==aToken.name){if(this.OnFSDirectoryChanged){this.OnFSDirectoryChanged(aToken);}}else if("fsddeleted"==aToken.name){if(this.OnFSDirectoryDeleted){this.OnFSDirectoryDeleted(aToken);}}else if("fsfcreated"==aToken.name){if(this.OnFSFileCreated){this.OnFSFileCreated(aToken);}}else if("fsfchanged"==aToken.name){if(this.OnFSFileChanged){this.OnFSFileChanged(aToken);}}else if("fsfdeleted"==aToken.name){if(this.OnFSFileDeleted){this.OnFSFileDeleted(aToken);}}else if("chunkreceived"==aToken.name){if(this.OnChunkReceived){this.OnChunkReceived(aToken);}}}}},fileSaveByChunks:function(aFilename,aData,aIsLast,aOptions){var lRes=this.createDefaultResult();aOptions=jws.getOptions(aOptions,{encoding:"base64",encode:true,notify:false,scope:jws.SCOPE_PRIVATE});var lEnc={};if(aOptions.encode){lEnc.data=aOptions.encoding;}if(this.isConnected()){var lToken={ns:jws.FileSystemPlugIn.NS,type:"saveByChunks",scope:aOptions.scope,encoding:aOptions.encoding,encode:aOptions.encode,notify:(jws.SCOPE_PUBLIC===aOptions.scope)&&aOptions.notify,data:aData,filename:aFilename,isLast:aIsLast||false,enc:lEnc};if(aOptions.alias){lToken.alias=aOptions.alias;}this.sendToken(lToken,aOptions);}else{lRes.code= -1;lRes.localeKey="jws.jsc.res.notConnected";lRes.msg="Not connected.";}return lRes;},fileLoadByChunks:function(aFilename,aAlias,aOffset,aLength,aOptions){var lRes=this.createDefaultResult();if(this.isConnected()){var lToken={ns:jws.FileSystemPlugIn.NS,type:"loadByChunks",alias:aAlias,filename:aFilename,offset:aOffset,length:aLength,encoding:aOptions['encoding']};this.sendToken(lToken,aOptions);}else{lRes.code= -1;lRes.localeKey="jws.jsc.res.notConnected";lRes.msg="Not connected.";}return lRes;},fileRename:function(aFilename,aNewFileName,aScope,aOptions){var lRes=this.checkConnected();if(0==lRes.code){var lToken={ns:jws.FileSystemPlugIn.NS,type:"rename",scope:aScope,filename:aFilename,newFilename:aNewFileName};this.sendToken(lToken,aOptions);}return lRes;},directoryDelete:function(aDirectory,aOptions){var lRes=this.checkConnected();if(0==lRes.code){var lToken={ns:jws.FileSystemPlugIn.NS,type:"deleteDirectory",directory:aDirectory};this.sendToken(lToken,aOptions);}return lRes;},fsStartObserve:function(aOptions){var lRes=this.checkConnected();if(0==lRes.code){var lToken={ns:jws.FileSystemPlugIn.NS,type:"startObserve"};this.sendToken(lToken,aOptions);}return lRes;},fsStopObserve:function(aOptions){var lRes=this.checkConnected();if(0==lRes.code){var lToken={ns:jws.FileSystemPlugIn.NS,type:"stopObserve"};this.sendToken(lToken,aOptions);}return lRes;},fileSendByChunks:function(aTargetId,aFilename,aData,aIsLast,aOptions){var lIsNode=false;var lEncoding="base64";var lEncode=true;var lIsLast=aIsLast||false;if(aOptions){lEncoding=aOptions["encoding"]||"base64";if(aOptions.isNode!=undefined){lIsNode=aOptions.isNode;}if(aOptions.encode!=undefined){lEncode=aOptions.encode;}}var lRes=this.checkConnected();if(0==lRes.code){var lEnc={};if(lEncode){lEnc.data=lEncoding;}var lToken={ns:jws.FileSystemPlugIn.NS,type:"sendByChunks",data:aData,enc:lEnc,encode:lEncode,encoding:lEncoding,filename:aFilename,isLast:lIsLast};if(lIsNode){lToken.unid=aTargetId;}else{lToken.targetId=aTargetId;}this.sendToken(lToken,aOptions);}return lRes;},fileUpload:function(aFile,aOptions){var lSelf=this;aOptions=jws.getOptions(aOptions,{OnError:function(){},OnComplete:function(){},OnProgress:function(){},prefix:"",postfix:"",encode:false,encoding:"base64",name:aFile.name,scope:jws.SCOPE_PRIVATE,chunkSize:5*1024});try{if(!(aFile instanceof File)){throw new Error("The 'file' argument require to be a 'File' class object!");}var lChunkSize=aOptions.chunkSize;var lName=aOptions.prefix+(aOptions.name)+aOptions.postfix;var lReader=new FileReader();lSelf.fileDelete(lName,true,{});aOptions.bytesSent=aOptions.offset||0;aOptions.bytesTotal=aFile.size;aOptions.file=aFile;var lCallable=function(aOffset,aLength){var lBlob=aFile.slice(aOffset,aOffset+aLength);if(aOptions.encode){lReader.readAsText(lBlob);}else{lReader.readAsDataURL(lBlob);}};lReader.onload=function(aEvt){var lIsLast=aOptions.bytesSent+lChunkSize>=aOptions.bytesTotal;var lData=aEvt.target.result;lSelf.fileSaveByChunks(lName,lData,lIsLast,{encoding:aOptions.encoding,encode:aOptions.encode,scope:aOptions.scope,OnSuccess:function(){aOptions.bytesSent+=(aOptions.bytesSent+lChunkSize>aFile.size)?aFile.size-aOptions.bytesSent:lChunkSize;aOptions.OnProgress();if(!lIsLast){lCallable(aOptions.bytesSent,lChunkSize);}else{aOptions.OnComplete();}},OnFailure:function(aToken){aOptions.OnError(aToken);}});};lCallable(aOptions.bytesSent,lChunkSize);}catch(lEx){aOptions.OnError(lEx);}},setEnterpriseFileSystemCallbacks:function(aListeners){if(!aListeners){aListeners={};}if(aListeners.OnFileLoaded!==undefined){this.OnFileLoaded=aListeners.OnFileLoaded;}if(aListeners.OnFileSaved!==undefined){this.OnFileSaved=aListeners.OnFileSaved;}if(aListeners.OnFileReceived!==undefined){this.OnFileReceived=aListeners.OnFileReceived;}if(aListeners.OnFileSent!==undefined){this.OnFileSent=aListeners.OnFileSent;}if(aListeners.OnFileError!==undefined){this.OnFileError=aListeners.OnFileError;}if(aListeners.OnLocalFileRead!==undefined){this.OnLocalFileRead=aListeners.OnLocalFileRead;}if(aListeners.OnLocalFileError!==undefined){this.OnLocalFileError=aListeners.OnLocalFileError;}if(aListeners.OnChunkReceived!==undefined){this.OnChunkReceived=aListeners.OnChunkReceived;}if(aListeners.OnChunkLoaded!==undefined){this.OnChunkLoaded=aListeners.OnChunkLoaded;}if(aListeners.OnFSDirectoryCreated!==undefined){this.OnFSDirectoryCreated=aListeners.OnFSDirectoryCreated;}if(aListeners.OnFSDirectoryChanged!==undefined){this.OnFSDirectoryChanged=aListeners.OnFSDirectoryChanged;}if(aListeners.OnFSDirectoryDeleted!==undefined){this.OnFSDirectoryDeleted=aListeners.OnFSDirectoryDeleted;}if(aListeners.OnFSFileDeleted!==undefined){this.OnFSFileDeleted=aListeners.OnFSFileDeleted;}if(aListeners.OnFSFileCreated!==undefined){this.OnFSFileCreated=aListeners.OnFSFileCreated;}if(aListeners.OnFSFileChanged!==undefined){this.OnFSFileChanged=aListeners.OnFSFileChanged;}}};jws.oop.addPlugIn(jws.jWebSocketTokenClient,jws.FileSystemPlugIn); 