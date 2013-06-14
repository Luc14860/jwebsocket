//  ---------------------------------------------------------------------------
//  jWebSocket - JMS Client Listener (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//  Alexander Schulze, Germany (NRW)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------
package org.jwebsocket.jms.client;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.jms.BytesMessage;
import javax.jms.MapMessage;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.ObjectMessage;
import javax.jms.TextMessage;

/**
 * Manages one or multiple listeners to a certain JMS Gateway connection.
 *
 * @author Alexander Schulze
 */
class JMSClientListener implements MessageListener {

	private List<IJMSMessageListener> mMessageListeners = new ArrayList();
	private final ExecutorService mExecutor;

	public JMSClientListener(int aThreadPoolSize) {
		mExecutor = Executors.newFixedThreadPool(aThreadPoolSize);
	}

	public void addMessageListener(IJMSMessageListener aListener) {
		mMessageListeners.add(aListener);
	}

	public void removeMessageListener(IJMSMessageListener aListener) {
		mMessageListeners.remove(aListener);
	}

	private void processMessage(final Message aMsg) {
		// a message has been received from the JMS Gateway
		// select the correct type of the message and 
		// call the corresponding listeners
		if (aMsg instanceof TextMessage) {
			TextMessage lTextMsg = (TextMessage) aMsg;
			for (IJMSMessageListener lListener : mMessageListeners) {
				lListener.onTextMessage(lTextMsg);
			}
		} else if (aMsg instanceof MapMessage) {
			MapMessage lMapMsg = (MapMessage) aMsg;
			for (IJMSMessageListener lListener : mMessageListeners) {
				lListener.onMapMessage(lMapMsg);
			}
		} else if (aMsg instanceof BytesMessage) {
			BytesMessage lMapMsg = (BytesMessage) aMsg;
			for (IJMSMessageListener lListener : mMessageListeners) {
				lListener.onBytesMessage(lMapMsg);
			}
		} else if (aMsg instanceof ObjectMessage) {
			ObjectMessage lMapMsg = (ObjectMessage) aMsg;
			for (IJMSMessageListener lListener : mMessageListeners) {
				lListener.onObjectMessage(lMapMsg);
			}
		}
	}

	@Override
	public void onMessage(final Message aMsg) {

		// if only a single threaded message processing is required
		// processMessage(aMsg);
		
		mExecutor.submit(new Runnable() {
			@Override
			public void run() {
				processMessage(aMsg);
			}
		});
	}

	public void shutdown() {
		mExecutor.shutdownNow();
		try {
			mExecutor.awaitTermination(2000, TimeUnit.MILLISECONDS);
		} catch (InterruptedException ex) {
			// TODO: Process exception properly
		}
		// mExecutor.isShutdown();
	}
}
