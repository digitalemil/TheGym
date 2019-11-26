package io.mesosphere.dcosappstudio;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandler;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.web.bind.annotation.*;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.json.JSONArray;
import org.json.JSONObject;


@RestController
@DependsOn("topic")
public class UIUpdater  {
    String pivotfieldname= "";
    String topic;
    JSONArray fields;
    Object lock= new Object();
   
    @Autowired
    private KafkaTemplate<String, String> kafka;
    private Socket socket;
    private PrintWriter socketout;

    public UIUpdater() {
        onStartup();
    }

    public void printMsg(String msg, int n) {
        if(n>64) {
            System.out.println("Unsuccessfull tried to connect to UI ("+n+" times), dropping message: "+msg);
            return;
        }
        synchronized(lock) {
            try {
                socketout.println(msg);
                if(socketout.checkError())
                    throw new Exception();
                socketout.flush();
                if(socketout.checkError())
                  throw new Exception();
            }
            catch(Exception e) {
                System.out.println("Can't communicate with UI (tried "+n+" times) over socket.\nReconnecting in 0.1 second...");
                try {
                    Thread.currentThread().sleep(100);
                } catch (InterruptedException e1) {
                    // TODO Auto-generated catch block
                    ///e1.printStackTrace();
               }
                connectToUI();
                printMsg(msg, ++n);
            }
        }
    }

    @KafkaListener(groupId="group", topics = "${topic.name}")
    public void listen(ConsumerRecord<?, ?> cr) throws Exception {
        String msg=   (String)cr.value();
        System.out.println("Received msg from Kafka, updating UI: "+msg);
        printMsg(msg, 0);
    }
   
    public void connectToUI() {
        try {
            socket = new Socket();
            socket.connect(new InetSocketAddress("127.0.0.1", 6969), 4);

            socketout = new PrintWriter(socket.getOutputStream(), true);
            System.out.println("Opened socket to UI (127.0.0.1:6969)");
        }
        catch(Exception e) {
            //e.printStackTrace();
        }
    }

    public void onStartup() {
        connectToUI();
        Map<String, String> env = System.getenv();
      
        String appdef= "";
		for (String envName : env.keySet()) {
			if(envName.equals("APPDEF"))
				appdef= env.get(envName);
		}
		String json= appdef.replaceAll("'", "\"");
		JSONObject jobj = null;
		jobj = new JSONObject(json);
        fields= jobj.getJSONArray("fields");
        topic= Topic.name;
        System.out.println("Using topic: "+topic);     

		for (int i = 0; i < fields.length(); i++) {
			JSONObject field= fields.getJSONObject(i);	
			
			if(field.get("pivot").toString().toLowerCase().equals("true")) {
				pivotfieldname= field.getString("name");
				System.out.println("Pivot field: "+pivotfieldname);
			}
        }
    }

    @RequestMapping("/")
    public String index() {
        return "Greetings from DCOSAppStudio 2.0 / UIUpdater";
    }

    public int postToUI(String u, String json) {
        System.out.println("Posting to: "+u+" Content: "+json);
        try {
            CloseableHttpClient client = HttpClients.createDefault();
            HttpPost httpPost = new HttpPost(u);
         
            StringEntity entity = new StringEntity(json);
            httpPost.setEntity(entity);
            httpPost.setHeader("Accept", "application/json");
            httpPost.setHeader("Content-type", "application/json");
         
            CloseableHttpResponse response = client.execute(httpPost);
            int ret= response.getStatusLine().getStatusCode();
            client.close();
            return ret;
        }
        catch(Exception e) {
            return 500;
        }
    }
}