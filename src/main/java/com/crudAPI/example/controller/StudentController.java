package com.crudAPI.example.controller;

import com.crudAPI.example.entity.Students;
import com.crudAPI.example.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/addStudent")
    public Students addStudents(@RequestBody Students students){
        return studentService.addStudents(students);
    }

    @GetMapping("/getStudent")
    public List<Students> getAllStudents(){
        return studentService.getAllStudents();
    }

    @PostMapping("/updateStudent")
    public Students updateStudents(@RequestBody Students students){
        return studentService.updateStudents(students);
    }

    @GetMapping("/deleteStudent/{id}")
    public Boolean deleteStudents(@PathVariable int id){
        return studentService.deleteStudents(id);
    }
}
