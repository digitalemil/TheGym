package de.digitalemil.thegym;

import java.io.IOException;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.expression.spel.SpelParserConfiguration;
import org.springframework.expression.spel.standard.*;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.expression.*;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.DependsOn;
import org.springframework.core.env.Environment;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;


@RestController
public class Listener {
    String pivotfieldname= "";
    String topic;
	JSONArray fields;
   
    
    @Autowired
    private KafkaTemplate<String, String> kafka;
    
   
    public Listener() {
        Map<String, String> env = System.getenv();
        if("true".equals(env.get("NONSECURE"))) {
			System.clearProperty("spring.kafka.properties.sasl.mechanism");
			System.clearProperty("spring.kafka.properties.security.protocol");
        	System.clearProperty("sasl.mechanism");
			System.clearProperty("security.protocol");
		
        }
        onStartup();
    }

  
    public void onStartup() {
        Map<String, String> env = System.getenv();
        String appdef= "";
		for (String envName : env.keySet()) {
			if(envName.equals("APPDEF"))
				appdef= env.get(envName);
		}
		String json= appdef.replaceAll("'", "\"");
		JSONObject jobj = null;
		jobj = new JSONObject(json);
        topic= jobj.get("topic").toString();
        System.out.println("Topic: "+topic);
        fields= jobj.getJSONArray("fields");
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
        return "Greetings from TheGym";
    }

    @RequestMapping(value= "/data", method = RequestMethod.POST, consumes = {"application/json"})
    public String data(HttpServletRequest request, 
    HttpServletResponse response, @RequestBody String json) throws IOException {     
        Map<String, String> env = System.getenv();
        System.out.println("Got: "+json);
        json= postToTransformer(env.get("TRANSFORMER"), json);
    
        if(! (postToValidator(env.get("VALIDATOR"), json) == 200))
          return "";
   
        System.out.println("Sending data to Kafka... "+json);
        kafka.send(topic, json);            
     
        return "Thanks for the data: "+ json+"\n";
    }

    public String postToTransformer(String u, String json) throws IOException {
        System.out.println("Posting to: "+u+" Content: "+json);
        String ret= "";
        try {
            CloseableHttpClient client = HttpClients.createDefault();
            HttpPost httpPost = new HttpPost(u);
         
            StringEntity entity = new StringEntity(json);
            httpPost.setEntity(entity);
            httpPost.setHeader("Accept", "application/json");
            httpPost.setHeader("Content-type", "application/json");
         
            CloseableHttpResponse response = client.execute(httpPost);
            ret = EntityUtils.toString( response.getEntity());

            client.close();
        }
        catch(Exception e) {
            throw new IOException();
        }
        return ret;
    }

    public int postToValidator(String u, String json) {
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