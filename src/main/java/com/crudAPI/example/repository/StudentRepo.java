package com.crudAPI.example.repository;

import com.crudAPI.example.entity.Students;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepo extends JpaRepository<Students, Integer> {

}
