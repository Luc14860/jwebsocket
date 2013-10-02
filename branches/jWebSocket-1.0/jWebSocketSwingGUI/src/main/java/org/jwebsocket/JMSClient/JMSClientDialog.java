/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jwebsocket.JMSClient;

import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.io.File;
import java.io.IOException;
import java.util.Map;
import javax.swing.JOptionPane;
import javax.swing.JTextArea;
import javolution.util.FastMap;
import org.apache.commons.io.FileUtils;
import org.jwebsocket.jms.endpoint.JMSEndPoint;
import org.jwebsocket.jms.endpoint.JWSEndPointMessageListener;
import org.jwebsocket.jms.endpoint.JWSEndPointSender;
import org.jwebsocket.jms.endpoint.JWSMessageListener;
import org.jwebsocket.packetProcessors.JSONProcessor;
import org.jwebsocket.token.Token;
import org.jwebsocket.token.TokenFactory;
import org.jwebsocket.util.Tools;

/**
 *
 * @author vbarzanacres
 */
public class JMSClientDialog extends javax.swing.JFrame {

	private JTextArea mLog;
	private String mBrokerURL;
	private String mGatewayTopic;
	private String mGatewayId;
	private String mEndPointId;
	private JMSEndPoint mJMSEndPoint;
	private JWSEndPointSender mSender;
	private JWSEndPointMessageListener mListener;
	private Thread mEndpointThreadRunner;
	private boolean mIsThreadRunning = false;
	private String TT_LOGIN = "login";
	private String TT_USERNAME = "username";
	private String TT_PASSWORD = "password";
	private String TT_DEFAULT_USERNAME = "root";
	private String TT_DEFAULT_PASSWORD = "root";
	private String TT_WELCOME = "welcome";
	private String TT_PING = "ping";
	private String TT_IDENTIFY = "identify";
	private final String NS_SYSTEM = "org.jwebsocket.plugins.system";

	/**
	 * Creates new form JMSClientDialog
	 */
	public JMSClientDialog() {
		initComponents();
	}

	public JMSClientDialog(JTextArea aField) {
		initComponents();
		mLog = aField;

		// tcp://172.20.116.68:61616 org.jwebsocket.jws2jms org.jwebsocket.jms2jws aschulze-dt
		// failover:(tcp://0.0.0.0:61616,tcp://127.0.0.1:61616)?initialReconnectDelay=100&randomize=false org.jwebsocket.jws2jms org.jwebsocket.jms2jws aschulze-dt
		log("jWebSocket JMS Gateway Demo Client initialized");
	}

	private void initializeEndpoint() {
		mBrokerURL = jtfBrokerURL.getText();
		mEndPointId = jtfEndpointID.getText();
		mGatewayId = jtfGatewayID.getText();
		mGatewayTopic = jtfTopic.getText();

		log("Using: "
				+ mBrokerURL + ", "
				+ mGatewayTopic + ", "
				+ mGatewayId + ", "
				+ mEndPointId);
		// instantiate a new jWebSocket JMS Gateway Client
		mJMSEndPoint = new JMSEndPoint(
				mBrokerURL,
				mGatewayTopic, // gateway topic
				mGatewayId, // gateway endpoint id
				mEndPointId, // unique node id
				5, // thread pool size, messages being processed concurrently
				JMSEndPoint.TEMPORARY // temporary (for clients)
				);

		// instantiate a high level JWSEndPointMessageListener
		mListener = new JWSEndPointMessageListener(mJMSEndPoint);
		// instantiate a high level JWSEndPointSender
		mSender = new JWSEndPointSender(mJMSEndPoint);

		// on welcome message from jWebSocket, authenticate against jWebSocket
		mListener.addRequestListener(mGatewayId, TT_WELCOME, new JWSMessageListener(mSender) {
			@Override
			public void processToken(String aSourceId, Token aToken) {
				log("Received 'welcome' from '" + aSourceId + ".");
				if (mGatewayTopic.equals(aSourceId)) {
					enableButtons();
					// create a login token...
					log("Authenticating against jWebSocket...");
					Token lToken = TokenFactory.createToken(NS_SYSTEM, TT_LOGIN);
					lToken.setString(TT_USERNAME, TT_DEFAULT_USERNAME);
					lToken.setString(TT_PASSWORD, TT_DEFAULT_PASSWORD);
					// and send it to the gateway (which is was the source of the message)
					sendToken(aSourceId, lToken);
				}
			}
		});

		mListener.addResponseListener(mGatewayId, TT_PING, new JWSMessageListener(mSender) {
			@Override
			public void processToken(String aSourceId, Token aToken) {
				log("Received 'pong' from '" + aSourceId + ".");
//				if (mGatewayTopic.equals(aSourceId)) {
				log(aToken.toString());
//				}
			}
		});

		mListener.addResponseListener(mGatewayId, TT_IDENTIFY, new JWSMessageListener(mSender) {
			@Override
			public void processToken(String aSourceId, Token aToken) {
				log("Received 'identify' from '" + aSourceId + ".");
//				if (mGatewayTopic.equals(aSourceId)) {
				log(aToken.toString());
//				}
			}
		});

		// process response of the JMS Gateway login...
		mListener.addResponseListener(NS_SYSTEM, TT_LOGIN,
				new JWSMessageListener(mSender) {
			@Override
			public void processToken(String aSourceId, Token aToken) {

				int lCode = aToken.getInteger("code", -1);
				if (0 == lCode) {
					log("Authentication against jWebSocket JMS Gateway successful.");
				} else {
					log("Authentication against jWebSocket JMS Gateway failed!");
				}

				// lSender.ping("server-aschulze-dt");
//				getIdentification();
				if (true) {
					return;
				}

				Map lArgs = new FastMap<String, Object>();
				// lSender.sendPayload("wcslv01.dev.nvdia.com", "com.ptc.windchill",
				//	"getNewPartRequest", lArgs, "{}"); // getLibraryPart, getManufacturerPart "wcslv01.dev.nvidia.com"
				log("Sending getLibraryPart");
				mSender.sendPayload("hqdvptas134", "com.ptc.windchill",
						"getLibraryPart", lArgs, "{}");
				/*
				 lSender.sendPayload("aschulze-dt", "org.jwebsocket.svcep.demo",
				 "demo1", lArgs, "{}");
				 */
				/*
				 lArgs.put("accessToken", lOAuth.getAccessToken());
				 lSender.sendPayload("server-aschulze-dt", "org.jwebsocket.svcep.demo",
				 "sso1", lArgs, "{}");
				 */
				/*
				 lSender.sendPayload("hqdvptas138", "com.ptc.windchill",
				 "createBOM", lArgs, "{}");
				 */
				if (true) {
					return;
				}

				// now to try to get some data from the service...
				lArgs = new FastMap<String, Object>();
				lArgs.put(TT_USERNAME, "anyUsername");
				lArgs.put(TT_PASSWORD, "anyPassword");
				lArgs.put("action", "CREATE");
				// send the payload to the target (here the JMS demo service)
				// lSender.forwardPayload("aschulze-dt", "org.jwebsocket.jms.demo",
				//		"forwardPayload", "4711", lArgs, null);
				// send the payload to the target (here the JMS demo service)
				mSender.sendPayload("HQDVPTAS110", "com.ptc.windchill",
						"getLibraryPart", lArgs, "{}");
			}
		});

		// process response of the JMS Gateway login...
		mListener.addResponseListener("org.jwebsocket.svcep.demo", "sso1",
				new JWSMessageListener(mSender) {
			@Override
			public void processToken(String aSourceId, Token aToken) {
				int lCode = aToken.getInteger("code", -1);
				if (0 == lCode) {
					log("Username was detected by server: '" + aToken.getString(TT_USERNAME) + "'");
				}
			}
		});

		// on welcome message from jWebSocket, authenticate against jWebSocket
		// lListener.addResponseListener("org.jwebsocket.jms.demo", "forwardPayload",
		// 		new JWSMessageListener(lSender) {
		mListener.addResponseListener("com.ptc.windchill", "getLibraryPart",
				new JWSMessageListener(mSender) {
			@Override
			public void processToken(String aSourceId, Token aToken) {
				log("Received 'forwardPayload'.");
				if (true) {
					return;
				}
				// String lBase64Encoded = lToken.getString("fileAsBase64");
				String lPayload = aToken.getString("payload");
				// specify the target file
				File lFile = new File("getLibraryPart.json");
				try {
					// take the zipped version of the file... 
					byte[] lBA = lPayload.getBytes("UTF-8");
					// and save it to the hard disk
					FileUtils.writeByteArrayToFile(lFile, lBA);
				} catch (Exception lEx) {
					log("File " + lFile.getAbsolutePath() + " could not be saved!");
				}
			}
		});

		// process response of the get data response...
		mListener.addResponseListener("tld.yourname.jms", "getData",
				new JWSMessageListener(mSender) {
			@Override
			public void processToken(String aSourceId, Token aToken) {
				int lCode = aToken.getInteger("code", -1);
				if (0 == lCode) {
					log("Data transfer successful.");
				} else {
					log("Data transfer failed!");
				}

				// reading a file using Apache Commons IO into a byte array
				File lFile = new File("Apache License 2.0.txt");
				byte[] lBA = null;
				try {
					lBA = FileUtils.readFileToByteArray(lFile);
				} catch (IOException lEx) {
					log("Demo file " + lFile.getAbsolutePath() + " could not be loaded!");
				}

				// if the file could properly being read...
				if (null != lBA) {
					// base64 encode it w/o any compression
					String lBase64Encoded = Tools.base64Encode(lBA);

					// or compress it as an zip archive
					String lBase64Zipped = null;
					try {
						lBase64Zipped = Tools.base64Encode(Tools.zip(lBA, false));
					} catch (Exception lEx) {
						log("File could not be compressed: " + lEx.getMessage());
					}

					Token lToken = TokenFactory.createToken();
					// put base64 encoded only version into message
					lToken.setString("fileAsBase64", lBase64Encoded);
					// and the zipped version as well (for demo purposes)
					lToken.setString("fileAsZip", lBase64Zipped);

					// generate the payload as JSON
					String lPayload = JSONProcessor.tokenToPacket(lToken).getUTF8();
					// add some optional arguments to be passed to the target
					Map lArgs = new FastMap<String, Object>();
					lArgs.put("arg1", "value1");
					lArgs.put("arg2", "value2");

					// send the payload to the target (here the JMS demo service)
					mSender.sendPayload("JMSServer", "tld.yourname.jms",
							"transferFile", lArgs, lPayload);
				}

				// and shut down the client
				log("Gracefully shutting down...");
				mSender.getEndPoint().shutdown();
			}
		});
		// add a high level listener to listen in coming messages
		mJMSEndPoint.addListener(mListener);
		mEndpointThreadRunner = new Thread(new Runnable() {
			@Override
			public void run() {
				// add a listener to listen in coming messages
				// lJMSClient.addListener(new JMSClientMessageListener(lJMSClient));

				// this is a console app demo
				// so wait in a thread loop until the client get shut down
				mJMSEndPoint.start();
				try {
					while (!mJMSEndPoint.isShutdown()) {
						Thread.sleep(1000);
					}
				} catch (InterruptedException lEx) {
					// ignore a potential exception here
				}
				shutdownEndpoint();
			}
		});
		mIsThreadRunning = true;
		// start the endpoint all all listener have been assigned
		mEndpointThreadRunner.start();
	}

	private void shutdownEndpoint() {
		try {
			if (mIsThreadRunning) {
				mEndpointThreadRunner.join(2000);
				mEndpointThreadRunner.stop();
				mIsThreadRunning = false;
			}
		} catch (InterruptedException aException) {
			log(aException.getMessage());
		}
		if (!mJMSEndPoint.isShutdown()) {
			// if not yet done...
			log("Shutting down JMS Client Endpoint...");
			// shut the client properly down
			mJMSEndPoint.shutdown();
		}
		disableButtons();
		log("JMS Client Endpoint properly shutdown.");
	}

	private void pingEndpoint(String aEndpointId) {
		if (!mJMSEndPoint.isShutdown()) {
			mSender.ping(aEndpointId);
		}
	}

	private void getIdentification() {
		if (!mJMSEndPoint.isShutdown()) {
			mSender.getIdentification("*");
		}
	}

	private void enableButtons() {
		jtfBrokerURL.setEnabled(false);
		jtfEndpointID.setEnabled(false);
		jtfGatewayID.setEnabled(false);
		jtfTopic.setEnabled(false);
		jbIdentify.setEnabled(true);
		jbOpen.setEnabled(false);
		jbPing.setEnabled(true);
		jbSSO.setEnabled(true);
		jbShutdown.setEnabled(true);
		jbSendPayload.setEnabled(true);
	}

	private void disableButtons() {
		jtfBrokerURL.setEnabled(true);
		jtfEndpointID.setEnabled(true);
		jtfGatewayID.setEnabled(true);
		jtfTopic.setEnabled(true);
		jbIdentify.setEnabled(false);
		jbOpen.setEnabled(true);
		jbPing.setEnabled(false);
		jbSSO.setEnabled(false);
		jbShutdown.setEnabled(false);
		jbSendPayload.setEnabled(false);
	}

	public void log(String aMessage) {
		synchronized (mLog) {
			int lMAX = 1000;
			int lLineCount = mLog.getLineCount();
			if (lLineCount > lMAX) {
				String lText = mLog.getText();
				int lIdx = 0;
				int lCnt = lLineCount;
				while (lIdx < lText.length() && lCnt > lMAX) {
					if (lText.charAt(lIdx) == '\n') {
						lCnt--;
					}
					lIdx++;
				}
				mLog.replaceRange("", 0, lIdx);
			}
			if (null != aMessage) {
				mLog.append(aMessage + '\n');
			} else {
				mLog.setText("");
			}
			mLog.setCaretPosition(mLog.getText().length());
		}
	}

	/**
	 * This method is called from within the constructor to initialize the form.
	 * WARNING: Do NOT modify this code. The content of this method is always
	 * regenerated by the Form Editor.
	 */
	@SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jLabel1 = new javax.swing.JLabel();
        jLabel2 = new javax.swing.JLabel();
        jLabel3 = new javax.swing.JLabel();
        jLabel4 = new javax.swing.JLabel();
        jtfTopic = new javax.swing.JTextField();
        jtfBrokerURL = new javax.swing.JTextField();
        jtfGatewayID = new javax.swing.JTextField();
        jtfEndpointID = new javax.swing.JTextField();
        jbOpen = new javax.swing.JButton();
        jbShutdown = new javax.swing.JButton();
        jbPing = new javax.swing.JButton();
        jbIdentify = new javax.swing.JButton();
        jbSSO = new javax.swing.JButton();
        jbSendPayload = new javax.swing.JButton();

        setDefaultCloseOperation(javax.swing.WindowConstants.DISPOSE_ON_CLOSE);
        setTitle("JMS Client Test");
        setAlwaysOnTop(true);
        setMinimumSize(null);
        setPreferredSize(new java.awt.Dimension(580, 270));
        setResizable(false);
        addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowClosed(java.awt.event.WindowEvent evt) {
                onWindowClosed(evt);
            }
        });

        jLabel1.setText("Topic");

        jLabel2.setText("BrokerURL");

        jLabel3.setText("Gateway ID");

        jLabel4.setText("Endpoint ID");

        jtfTopic.setText("org.jwebsocket.jms.gateway");
        jtfTopic.setToolTipText("");
        jtfTopic.setMinimumSize(null);
        jtfTopic.setPreferredSize(new java.awt.Dimension(200, 20));

        jtfBrokerURL.setText("tcp://hqdvalsap01:61616");
        jtfBrokerURL.setToolTipText("");
        jtfBrokerURL.setMinimumSize(null);
        jtfBrokerURL.setPreferredSize(new java.awt.Dimension(200, 20));

        jtfGatewayID.setText("org.jwebsocket.jms.gateway");
        jtfGatewayID.setToolTipText("");
        jtfGatewayID.setMinimumSize(null);
        jtfGatewayID.setPreferredSize(new java.awt.Dimension(200, 20));

        jtfEndpointID.setText("vbarzanacres-dt");
        jtfEndpointID.setMinimumSize(null);
        jtfEndpointID.setPreferredSize(new java.awt.Dimension(200, 20));

        jbOpen.setText("Open");
        jbOpen.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jbOpenActionPerformed(evt);
            }
        });

        jbShutdown.setText("Shutdown");
        jbShutdown.setEnabled(false);
        jbShutdown.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jbShutdownActionPerformed(evt);
            }
        });

        jbPing.setText("Ping");
        jbPing.setEnabled(false);
        jbPing.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jbPingActionPerformed(evt);
            }
        });

        jbIdentify.setText("Identify");
        jbIdentify.setEnabled(false);
        jbIdentify.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jbIdentifyActionPerformed(evt);
            }
        });

        jbSSO.setText("SSO");
        jbSSO.setEnabled(false);

        jbSendPayload.setText("Send Payload");
        jbSendPayload.setEnabled(false);
        jbSendPayload.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jbSendPayloadActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addGap(31, 31, 31)
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jLabel4)
                    .addComponent(jLabel1)
                    .addComponent(jLabel3)
                    .addComponent(jLabel2))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jtfEndpointID, javax.swing.GroupLayout.PREFERRED_SIZE, 410, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                        .addComponent(jtfTopic, javax.swing.GroupLayout.PREFERRED_SIZE, 410, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(jtfGatewayID, javax.swing.GroupLayout.PREFERRED_SIZE, 410, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(jtfBrokerURL, javax.swing.GroupLayout.PREFERRED_SIZE, 410, javax.swing.GroupLayout.PREFERRED_SIZE))))
                .addGap(31, 31, 31))
            .addGroup(layout.createSequentialGroup()
                .addGap(18, 18, 18)
                .addComponent(jbOpen, javax.swing.GroupLayout.PREFERRED_SIZE, 81, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jbShutdown)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jbPing, javax.swing.GroupLayout.PREFERRED_SIZE, 81, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jbIdentify, javax.swing.GroupLayout.PREFERRED_SIZE, 81, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jbSSO, javax.swing.GroupLayout.PREFERRED_SIZE, 81, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jbSendPayload)
                .addGap(0, 19, Short.MAX_VALUE))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addGap(22, 22, 22)
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                    .addGroup(layout.createSequentialGroup()
                        .addComponent(jLabel1)
                        .addGap(22, 22, 22)
                        .addComponent(jLabel2)
                        .addGap(24, 24, 24)
                        .addComponent(jLabel3)
                        .addGap(24, 24, 24)
                        .addComponent(jLabel4))
                    .addGroup(layout.createSequentialGroup()
                        .addComponent(jtfTopic, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(16, 16, 16)
                        .addComponent(jtfBrokerURL, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addComponent(jtfGatewayID, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addComponent(jtfEndpointID, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)))
                .addGap(38, 38, 38)
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jbOpen)
                    .addComponent(jbShutdown)
                    .addComponent(jbPing)
                    .addComponent(jbIdentify)
                    .addComponent(jbSSO)
                    .addComponent(jbSendPayload))
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void jbOpenActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jbOpenActionPerformed
		this.initializeEndpoint();
    }//GEN-LAST:event_jbOpenActionPerformed

    private void jbShutdownActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jbShutdownActionPerformed
		this.shutdownEndpoint();
    }//GEN-LAST:event_jbShutdownActionPerformed

    private void jbPingActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jbPingActionPerformed
		String lEndpointId = JOptionPane.showInputDialog("Please provide the ID of the endpoint you want to ping");
		if (null != lEndpointId && !lEndpointId.trim().equals("")) {
			this.pingEndpoint(lEndpointId);
		}
    }//GEN-LAST:event_jbPingActionPerformed

    private void jbIdentifyActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jbIdentifyActionPerformed
		this.getIdentification();
    }//GEN-LAST:event_jbIdentifyActionPerformed

    private void onWindowClosed(java.awt.event.WindowEvent evt) {//GEN-FIRST:event_onWindowClosed
		this.shutdownEndpoint();
    }//GEN-LAST:event_onWindowClosed

    private void jbSendPayloadActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jbSendPayloadActionPerformed
		JMSSendPayloadDialog lPayloadDialog = new JMSSendPayloadDialog(this, mSender, mListener);
		lPayloadDialog.setLocation(this.getLocation().x,
				this.getLocation().y);
		lPayloadDialog.setAlwaysOnTop(true);
		lPayloadDialog.setVisible(true);
		final JMSClientDialog lMe = this;
		lMe.setVisible(false);
		lPayloadDialog.addWindowListener(new WindowListener() {
			@Override
			public void windowOpened(WindowEvent e) {
			}

			@Override
			public void windowClosing(WindowEvent e) {
			}

			@Override
			public void windowClosed(WindowEvent e) {
				lMe.setVisible(true);
				lMe.setAlwaysOnTop(true);
			}

			@Override
			public void windowIconified(WindowEvent e) {
			}

			@Override
			public void windowDeiconified(WindowEvent e) {
			}

			@Override
			public void windowActivated(WindowEvent e) {
			}

			@Override
			public void windowDeactivated(WindowEvent e) {
			}
		});
    }//GEN-LAST:event_jbSendPayloadActionPerformed

	/**
	 * @param args the command line arguments
	 */
	public static void main(String args[]) {
		/* Set the Nimbus look and feel */
		//<editor-fold defaultstate="collapsed" desc=" Look and feel setting code (optional) ">
        /* If Nimbus (introduced in Java SE 6) is not available, stay with the default look and feel.
		 * For details see http://download.oracle.com/javase/tutorial/uiswing/lookandfeel/plaf.html 
		 */
		try {
			for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
				if ("Nimbus".equals(info.getName())) {
					javax.swing.UIManager.setLookAndFeel(info.getClassName());
					break;
				}
			}
		} catch (ClassNotFoundException ex) {
			java.util.logging.Logger.getLogger(JMSClientDialog.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
		} catch (InstantiationException ex) {
			java.util.logging.Logger.getLogger(JMSClientDialog.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
		} catch (IllegalAccessException ex) {
			java.util.logging.Logger.getLogger(JMSClientDialog.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
		} catch (javax.swing.UnsupportedLookAndFeelException ex) {
			java.util.logging.Logger.getLogger(JMSClientDialog.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
		}
		//</editor-fold>

		/* Create and display the form */
		java.awt.EventQueue.invokeLater(new Runnable() {
			public void run() {
				new JMSClientDialog().setVisible(true);
			}
		});
	}
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel3;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JButton jbIdentify;
    private javax.swing.JButton jbOpen;
    private javax.swing.JButton jbPing;
    private javax.swing.JButton jbSSO;
    private javax.swing.JButton jbSendPayload;
    private javax.swing.JButton jbShutdown;
    private javax.swing.JTextField jtfBrokerURL;
    private javax.swing.JTextField jtfEndpointID;
    private javax.swing.JTextField jtfGatewayID;
    private javax.swing.JTextField jtfTopic;
    // End of variables declaration//GEN-END:variables
}
