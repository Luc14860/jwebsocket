/*
 *
 * @author Osvaldo Aguilar Lauzurique, Alexander Rojas Hernández, Victor Antonio Barzana Crespo
 */
Ext.Loader.setConfig({
	enabled: true,
	disableCaching: false,
	paths: {
		'Ext.jws': '../../res/js/jWebSocketSenchaPlugIn-5.x/'
	}
});
Ext.require([
	'Ext.data.*',
	'Ext.grid.*',
	'Ext.form.*',
	'Ext.jws.Client',
	'Ext.jws.data.Proxy',
	'Ext.jws.form.action.Load',
	'Ext.jws.form.action.Submit'
]);

jws.ExtJSDemo = {
	NS_EXTJS_DEMO: jws.NS_BASE + '.plugins.sencha',
	// Type of tokens
	LISTENER_OPEN: 'OnOpen',
	LISTENER_CLOSE: 'OnClose',
	LISTENER_LOGON: 'OnLogon',
	LISTENER_WELCOME: 'OnWelcome',
	TT_REGISTER: 'register',
	TT_CREATE: 'create',
	TT_READ: 'read',
	TT_UPDATE: 'update',
	TT_DESTROY: 'destroy',
	TT_RESET: 'reset',
	TT_NOTIFY_CREATE: 'notifyCreate',
	TT_NOTIFY_UPDATE: 'notifyUpdate',
	TT_NOTIFY_DESTROY: 'notifyDestroy',
	TT_NOTIFY_RESET: 'notifyReset',
	// Texts
	TEXT_CONNECTED: "connected",
	TEXT_AUTHENTICATED: "authenticated",
	TEXT_DISCONNECTED: "disconnected",
	TEXT_WEBSOCKET: "WebSocket: ",
	TEXT_CLIENT_ID: "Client-ID: ",
	// Styles
	CLS_AUTH: "authenticated",
	CLS_ONLINE: "online",
	CLS_OFFLINE: "offline",
	IS_INITIALIZED: false
};

Ext.onReady(function () {
	// DOM elements
	var eDisconnectMessage = Ext.get("not_connected"),
			eBtnDisconnect = Ext.get("disconnect_button"),
			eBtnConnect = Ext.get("connect_button"),
			eClient = document.getElementById("client_status");
	eClientId = document.getElementById("client_id");
	eWebSocketType = document.getElementById("websocket_type");

	Ext.jwsClient.on(jws.ExtJSDemo.LISTENER_OPEN, function () {
		// Registering to the Sencha demo to receive notifications 
		// from the server when other clients create, update or remove 
		// users from the server users list
		eClient.innerHTML = jws.ExtJSDemo.TEXT_CONNECTED;
		eClient.className = jws.ExtJSDemo.CLS_ONLINE;

		eBtnDisconnect.show();
		eBtnConnect.hide();
		eDisconnectMessage.hide();
	});

	Ext.jwsClient.on(jws.ExtJSDemo.LISTENER_WELCOME, function (aToken) {
		if ("anonymous" === aToken.username) {
			Ext.jwsClient.getConnection().systemLogon(jws.DEMO_ROOT_LOGINNAME, jws.DEMO_ROOT_PASSWORD);
		}
	});

	Ext.jwsClient.on(jws.ExtJSDemo.LISTENER_LOGON, function (aToken) {
		if (aToken.username) {
			eClient.innerHTML = aToken.username;
		}
		Ext.jwsClient.send(jws.ExtJSDemo.NS_EXTJS_DEMO, jws.ExtJSDemo.TT_REGISTER);

		eClient.className = jws.ExtJSDemo.CLS_AUTH;
		eBtnDisconnect.show();
		eBtnConnect.hide();
		eDisconnectMessage.hide();
		initDemo();
	});

	Ext.jwsClient.on(jws.ExtJSDemo.LISTENER_CLOSE, function () {
		eClient.innerHTML = jws.ExtJSDemo.TEXT_DISCONNECTED;
		eClient.className = jws.ExtJSDemo.CLS_OFFLINE;
		eDisconnectMessage.show();
		eBtnDisconnect.hide();
		eBtnConnect.show();
		exitDemo();
		eWebSocketType.innerHTML = jws.ExtJSDemo.TEXT_WEBSOCKET + "-";
		eClientId.innerHTML = jws.ExtJSDemo.TEXT_CLIENT_ID + "- ";
	});

	eBtnDisconnect.hide();
	eBtnConnect.on("click", function () {
		Ext.jwsClient.open();
	});

	eBtnDisconnect.on("click", function () {
		Ext.jwsClient.getConnection().systemLogoff({
			OnSuccess: function (aToken) {
				Ext.jwsClient.close();
			},
			OnFailure: function () {
				Ext.jwsClient.close();
			}
		});
	});
	Ext.jwsClient.open();
});

function initDemo() {
	if (!jws.ExtJSDemo.IS_INITIALIZED) {
		jws.ExtJSDemo.IS_INITIALIZED = true;
		Ext.tip.QuickTipManager.init();
		var lJWebSocketProxy = new Ext.jws.data.Proxy({
			ns: jws.ExtJSDemo.NS_EXTJS_DEMO,
			api: {
				create: jws.ExtJSDemo.TT_CREATE,
				read: jws.ExtJSDemo.TT_READ,
				update: jws.ExtJSDemo.TT_UPDATE,
				destroy: jws.ExtJSDemo.TT_DESTROY
			},
			reader: {
				root: 'data',
				totalProperty: 'totalCount'
			}
		});
		Ext.define('User', {
			extend: 'Ext.data.Model',
			fields: [{
					name: 'id',
					type: 'int',
					useNull: true
				},
				'name',
				'email', {
					name: 'age',
					type: 'int',
					useNull: true
				}],
			proxy: lJWebSocketProxy
		});
		var lUserStore = new Ext.data.Store({
//		autoSync: true,
			autoLoad: true,
			pageSize: 10,
			model: 'User',
			proxy: lJWebSocketProxy,
			listeners: {
				write: function (aStore, aOperation) {
					var lRecord = aOperation.getRecords()[0],
							lName = Ext.String.capitalize(aOperation.action),
							lText;

					if (lName === jws.ExtJSDemo.TT_DESTROY) {
						lRecord = aOperation.records[0];
						lText = 'Destroyed';
					} else {
						lText = lName + 'd';
					}


					var lForm = lFormPanel.getForm();
					if (aOperation.action !== jws.ExtJSDemo.TT_DESTROY) {
						lForm.loadRecord(lRecord);

						Ext.getCmp('submit_button').setText('Update User');
					}

					var lMessage = Ext.String.format("{0} user: {1}", lText, lRecord.getId());
					log(0, lMessage);
				}
			}
		});

		var lRowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
			listeners: {
				edit: function (aOperation, aContext) {
					if (aContext.record.data) {
						if (aContext.record.data.email && aContext.record.data.name) {
							aContext.record.save();
						}
					}
				}
			}
		});

		// create Vtype for vtype:'num'
		var lNumTest = /^[0-9]+$/;
		Ext.apply(Ext.form.field.VTypes, {
			num: function (aVal, aField) {
				return lNumTest.test(aVal);
			},
			// vtype Text property: The error text to display when the validation function returns false
			numText: 'Not a valid number.  Must be only numbers".'
		});

		//=====form============
		var lFormPanel = Ext.create('Ext.form.Panel', {
			jwsSubmit: true,
			frame: false,
			bodyPadding: 20,
			id: 'formPanelCreate',
			border: false,
			bodyStyle: 'background-color:#D8E4F2',
			buttonAlign: 'center',
			defaults: {
				msgTarget: 'side',
				width: '100%',
				labelWidth: 70
			},
			items: [{
					xtype: 'hidden',
					name: 'id',
					id: 'id'
				}, {
					xtype: 'textfield',
					name: 'name',
					id: 'name',
					//vtype:'alphanum',
					fieldLabel: 'Name',
					allowBlank: false,
					emptyText: 'required...',
					blankText: 'required',
					minLength: 2
				}, {
					xtype: 'textfield',
					name: 'email',
					id: 'email',
					fieldLabel: 'email',
					vtype: 'email',
					allowBlank: false,
					emptyText: 'required...'
				}, {
					xtype: 'textfield',
					name: 'age',
					id: 'age',
					fieldLabel: 'Age',
					vtype: 'num',
					emptyText: 'required...',
					allowBlank: false
				}],
			buttons: [{
					xtype: 'button',
					text: 'Add User',
					id: 'submit_button',
					width: 120,
					handler: function () {
						var lForm = this.up('form').getForm();
						var lAction = null;
						if (lForm.findField('id').getValue() !== "") {
							lAction = {
								ns: jws.ExtJSDemo.NS_EXTJS_DEMO,
								tokentype: jws.ExtJSDemo.TT_UPDATE,
								params: {
									updateForm: 'yes'
								}
							};
						} else {
							lAction = {
								ns: jws.ExtJSDemo.NS_EXTJS_DEMO,
								tokentype: jws.ExtJSDemo.TT_CREATE
							};
						}
						lAction.failure = function (aForm, aAction) {
							if (aAction === 'undefined') {
								var message = "Please you have errors in the form";
								log(-1, message);
							} else {
								log(-1, aAction.response.message || aAction.response.msg);
							}
						};

						lAction.success = function (aForm, aAction) {
							Ext.getCmp('submit_button').setText('Add User');
//							aForm.reset();
							log(aAction.response.code, aAction.response.message);
						};

						if (lForm.isValid())
							lForm.submit(lAction);
						else {
							var lMessage = "Please you have errors in the form";
							log(-1, lMessage);
						}
					}
				},
				{
					xtype: 'button',
					text: 'Reset',
					width: 120,
					handler: function () {
						var lForm = this.up('form').getForm();
						Ext.getCmp('submit_button').setText('Add User');
						lForm.reset();
					}
				}]
		});

		//=====gridPanel=======
		var lGridPanel = Ext.create('Ext.grid.Panel', {
			store: lUserStore,
			border: false,
			frame: false,
			plugins: [lRowEditor],
			allowDeselect: true,
			mLastSelected: -1,
			viewConfig: {
				loadMask: false
			},
			columns: [{
					text: 'ID',
					width: 45,
					sortable: true,
					dataIndex: 'id'
				}, {
					text: 'Name',
					width: 125,
					sortable: true,
					dataIndex: 'name',
					field: {
						xtype: 'textfield',
						allowBlank: false
								//					vtype: 'alpha'
					}
				}, {
					header: 'Email',
					width: 160,
					sortable: true,
					dataIndex: 'email',
					field: {
						xtype: 'textfield',
						allowBlank: false,
						vtype: 'email'
					}
				}, {
					text: 'Age',
					width: 45,
					flex: 1,
					sortable: true,
					dataIndex: 'age',
					field: {
						xtype: 'textfield',
						vtype: 'num',
						allowBlank: false
					}
				}],
			listeners: {
				select: function (aView, aRecord, aIndex) {
					lGridPanel.mLastSelected = aIndex;
					var lForm = lFormPanel.getForm(),
							lAction = {
								ns: jws.ExtJSDemo.NS_EXTJS_DEMO,
								tokentype: jws.ExtJSDemo.TT_READ,
								params: {
									id: lGridPanel.mLastSelected
								}
								// Optional
//					success: function(aForm, aToken) {
//						console.log("success");
//						console.log(aToken);
//					},
//					failure: function(aForm, aToken) {
//						console.log("failure");
//						console.log(aToken);
//					}
							};

					// This action in this case is not necessary but is a real 
					// example how the jWebSocket implementation for the load 
					// action works, this could simply be changed by a 
					// lForm.loadRecord(aRecord.index)
					lForm.load(lAction);

					Ext.getCmp('submit_button').setText('Update User');
				},
				selectionchange: function (aSelModel, aSelections) {
					lGridPanel.down('#delete').setDisabled(aSelections.length === 0);
				}
			},
			dockedItems: [{
					xtype: 'toolbar',
					items: [{
							text: 'Add',
							iconCls: 'icon-add',
							handler: function (aAction) {
								var lPhantoms = lUserStore.getNewRecords();
								Ext.Array.each(lPhantoms, function (el) {
									lUserStore.remove(el);
								});

								lUserStore.insert(0, new User());

								lRowEditor.startEdit(0, 0);
							}
						}, '-', {
							itemId: 'delete',
							text: 'Delete',
							iconCls: 'icon-delete',
							disabled: true,
							handler: function () {
								var lSelection = lGridPanel.getView().getSelectionModel().getSelection()[0];
								if (lSelection) {
									var lId = lSelection.data.id;
									var lForm = Ext.getCmp('formPanelCreate').getForm();
									lForm.reset();
									lUserStore.remove(lSelection);
									lUserStore.save();
								}
							}
						}, '-', {
							itemId: 'reset',
							text: 'Reset to default',
							iconCls: 'icon-reset',
							disabled: false,
							handler: function () {
								Ext.jwsClient.send(jws.ExtJSDemo.NS_EXTJS_DEMO, jws.ExtJSDemo.TT_RESET);
								var lSelection = lGridPanel.getView().getSelectionModel().getSelection()[0];
								if (lSelection) {
									var lId = lSelection.data.id;
									var lForm = Ext.getCmp('formPanelCreate').getForm();
									lForm.reset();
								}
							}
						}]
				}],
			bbar: Ext.create('Ext.PagingToolbar', {
				store: lUserStore,
				displayInfo: true,
				displayMsg: 'Users {0} - {1} of {2}',
				emptyMsg: "No rows to display"
			})
		});

		lGridPanel.getView().on('beforeitemkeydown', function (aView, aRecord, aItem, aIdx, aEvent) {
			if (aEvent.keyCode === 13) {
				lFormPanel.loadRecord(aRecord);
			}

		});
		function log(aType, aMsg) {
			var lBody = Ext.get('console');
			if (aType === 0) {
				lBody.update('<i>Last action</i><br> \n\
                <b style=color:green> Message: </b> ' + aMsg);
			} else if (aType === -1) {
				lBody.update('<i>Last action</i><br>\n\
                <b style=color:red> Message: </b> ' + aMsg);
			}
		}

		var lTabPanel = Ext.create('Ext.tab.Panel', {
			width: 280,
			height: 180,
			activeTab: 0,
			items: [{
					title: 'Output Messages',
					id: 'message',
					bodyStyle: 'padding:5px;',
					html: '<div id="console"></div>'
				}, {
					title: 'About',
					contentEl: 'contact',
					bodyStyle: 'overflow: auto;'
				}]
		});

		Ext.create('Ext.panel.Panel', {
			id: 'main_layout_container',
			width: '100%',
			height: 500,
			layout: 'border',
			items: [{
					xtype: 'panel',
					title: 'ExtJS Grid jWebSocket demo',
					id: "gridDemo",
					region: 'north',
					iconCls: 'icon-user',
					split: true,
					layout: 'fit',
					widht: '100%',
					height: 300,
					items: [lGridPanel]
				}, {
					title: 'ExtJS form jWebSocket demo',
					id: "formDemo",
					region: 'center',
					layout: 'fit',
					margin: '0 1 2 2',
					items: [lFormPanel]
				}, {
					xtype: 'panel',
					title: 'Console jWebSocket demo',
					id: "consoleDemo",
					region: 'east',
					width: "50%",
					collapsible: true,
					layout: 'fit',
					margin: '0 2 2 1',
					items: [lTabPanel]
				}],
			renderTo: 'ext_render_container'
		});

		Ext.jwsClient.addPlugIn({
			processToken: function (aToken) {
				if (aToken.ns === jws.ExtJSDemo.NS_EXTJS_DEMO) {
					if (aToken.type === jws.ExtJSDemo.TT_NOTIFY_CREATE ||
							aToken.type === jws.ExtJSDemo.TT_NOTIFY_UPDATE ||
							aToken.type === jws.ExtJSDemo.TT_NOTIFY_DESTROY ||
							aToken.type === jws.ExtJSDemo.TT_NOTIFY_RESET) {
						log(0, aToken.message);
						var lOptions = {};
						if (aToken.type === jws.ExtJSDemo.TT_NOTIFY_UPDATE) {
							lOptions = {
								callback: function () {
									lGridPanel.getSelectionModel().select(lGridPanel.mLastSelected);
								}
							};
						}
						lUserStore.load(lOptions);
					}
				}
				if (aToken.type === "welcome") {
					eClientId.innerHTML = jws.ExtJSDemo.TEXT_CLIENT_ID + aToken.sourceId;
					eWebSocketType.innerHTML = jws.ExtJSDemo.TEXT_WEBSOCKET + (jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)");
				}
			}
		});
	} else {
		Ext.getCmp("main_layout_container").show();
	}
}

function exitDemo() {
	Ext.getCmp("main_layout_container").hide();
}