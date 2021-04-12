package com.zorup.statics.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/template")
    public String viewPost(){
        return "temp";
    }

    @GetMapping("/error")
    public String error(){
        return "error";
    }

    @GetMapping("/test")
    public String test() { return "test"; }
}
