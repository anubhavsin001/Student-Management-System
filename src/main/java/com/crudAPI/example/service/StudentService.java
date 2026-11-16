package com.crudAPI.example.service;

import com.crudAPI.example.entity.Students;
import com.crudAPI.example.repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepo studentRepo;
    public Students addStudents(Students student) {
        return studentRepo.save(student);
    }

    public List<Students> getAllStudents() {
        return studentRepo.findAll();
    }

    public Students updateStudents(Students updatedStudent) {
        Optional<Students> student1 = studentRepo.findById(updatedStudent.getID());
        Students student = student1.get();
        student.setAge(updatedStudent.getAge());
        student.setDepartment(updatedStudent.getDepartment());
        student.setName(updatedStudent.getName());

        return studentRepo.save(student);
    }

    public Boolean deleteStudents(int id) {
        studentRepo.deleteById(id);
        return true;
    }
}
