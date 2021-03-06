package com.base.role.service.impl;

import com.base.dept.model.Department;
import com.base.role.model.Role;
import com.base.role.model.RoleData;
import com.base.role.model.RoleVO;
import com.base.role.mapper.RoleDataMapper;
import com.base.role.mapper.RoleFunctionMapper;
import com.base.role.mapper.RoleMapper;
import com.base.role.model.RoleFunctionMap;
import com.base.role.service.RoleService;
import com.base.user.model.UserRoleVO;
import com.common.framework.base.BaseMapper;
import com.common.framework.base.BaseServiceImpl;
import com.common.framework.util.BeanUtil;
import com.common.framework.util.ModelUtil;
import com.common.framework.util.PageBean;
import com.common.framework.util.PagedResult;
import com.common.framework.util.ServiceUtil;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

/**
 * 部门接口类
 *
 * @date 2017年04月03日
 */
@Service
public class RoleServiceImpl extends BaseServiceImpl<Role> implements RoleService {

    @Resource
    private RoleMapper roleMapper;
    @Resource
    private RoleFunctionMapper roleFunctionMapper;

    @Resource
    private RoleDataMapper roleDataMapper;

    @Override
    public BaseMapper getMapper() {
        return roleMapper;
    }


    @Override
    public PagedResult<Role> selectPageList(PageBean pageBean, Role role) {
        ServiceUtil.startPage(pageBean);
        return BeanUtil.toPagedResult(roleMapper.selectListByRole(role));
    }

    @Override
    public PagedResult<UserRoleVO> selectPageList(PageBean pageBean, String loginName) {
        ServiceUtil.startPage(pageBean);
        return BeanUtil.toPagedResult(roleMapper.selectListByLoginName(loginName));
    }

    @Transactional
    @Override
    public void addRoleAndRoleFunction(RoleVO roleVO) throws Exception {
        Role role = roleVO;
        String roleCode = "ROLE" + System.currentTimeMillis();
        role.setRoleCode(roleCode);
        ModelUtil.insertInit(role);
        super.insertSelective(role);
        List<String> functionCodes = roleVO.getFunctionCodes();

        RoleFunctionMap roleFunctionMap;
        for (String functionCode : functionCodes) {
            roleFunctionMap = new RoleFunctionMap(roleCode, functionCode);
            ModelUtil.insertInit(roleFunctionMap);
            roleFunctionMapper.insert(roleFunctionMap);
        }

        List<Department> authData = roleVO.getAuthData();
        RoleData roleData = null;
        for (Department dept : authData) {
            roleData = new RoleData(roleCode, dept.getDeptCode());
            roleData.setCtrlType(dept.getDeptType());
            ModelUtil.insertInit(roleData);
            roleDataMapper.insert(roleData);
        }
    }

    @Transactional
    @Override
    public void updateRoleAndRoleFunction(RoleVO roleVO) throws Exception {
        ModelUtil.updateInit(roleVO);
        super.updateByPrimaryKeySelective(roleVO);
        List<String> functionCodes = roleVO.getFunctionCodes();
        String roleCode = roleVO.getRoleCode();
        RoleFunctionMap roleFunctionMap = new RoleFunctionMap(roleCode);
        roleFunctionMapper.delete(roleFunctionMap);
        if (CollectionUtils.isNotEmpty(functionCodes)) {
            for (String functionCode : functionCodes) {
                roleFunctionMap = new RoleFunctionMap(roleCode, functionCode);
                ModelUtil.insertInit(roleFunctionMap);
                roleFunctionMapper.insert(roleFunctionMap);
            }
        }

        RoleData roleData = new RoleData();
        roleData.setRoleCode(roleCode);
        roleDataMapper.delete(roleData);
        List<Department> authData = roleVO.getAuthData();
        if (CollectionUtils.isNotEmpty(authData)) {
            for (Department dept : authData) {
                roleData = new RoleData(roleCode, dept.getDeptCode());
                roleData.setCtrlType(dept.getDeptType());
                ModelUtil.insertInit(roleData);
                roleDataMapper.insert(roleData);
            }
        }

    }

}
