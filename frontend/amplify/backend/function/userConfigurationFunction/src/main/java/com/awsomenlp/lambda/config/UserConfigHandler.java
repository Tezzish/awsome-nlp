

package com.awsomenlp.lambda.config;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class UserConfigHandler implements RequestHandler<Config, String>{

    @Override
    public String handleRequest(Config config, Context context) {
        return config.toString();
    }
}