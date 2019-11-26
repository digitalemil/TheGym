package io.mesosphere.dcosappstudio;

import java.util.Map;

import org.json.JSONObject;

public class Topic {
    public static String name= "foo";

    public Topic() {
        Map<String, String> env = System.getenv();
        String appdef= env.get("APPDEF");
        String json= appdef.replaceAll("'", "\"");
        JSONObject jobj = new JSONObject(json);
        name= jobj.getString("topic");
        System.setProperty("topic.name", name);
        System.out.println("new Topic: "+name);
    }
}