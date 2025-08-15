import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
  CAlert,
  CButtonGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilCaretBottom } from '@coreui/icons';
import api from '../../api';

const TemplateEditor = () => {
  const { reportId, templateId } = useParams();
  const navigate = useNavigate();

  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeElements, setActiveElements] = useState(new Set());
  
  // States for section/subsection/dynamic option set selection and creation
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedSubsectionId, setSelectedSubsectionId] = useState(null);
  const [selectedDynamicOptionSetId, setSelectedDynamicOptionSetId] = useState(null); // New
  const [activeAccordionItem, setActiveAccordionItem] = useState([]); // For accordion control, initialized as an empty array

  // States for Template Categories
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Modals visibility
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddSubsectionModal, setShowAddSubsectionModal] = useState(false);
  const [showAddDynamicOptionSetModal, setShowAddDynamicOptionSetModal] = useState(false); // New
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showEditSubsectionModal, setShowEditSubsectionModal] = useState(false);
  const [showEditDynamicOptionSetModal, setShowEditDynamicOptionSetModal] = useState(false); // New
  const [showEditElementModal, setShowEditElementModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  // Form states for new section
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDefaultText, setNewSectionDefaultText] = useState('');
  const [newSectionDisplayOrder, setNewSectionDisplayOrder] = useState('');

  // Form states for new subsection
  const [newSubsectionTitle, setNewSubsectionTitle] = useState('');
  const [newSubsectionDisplayOrder, setNewSubsectionDisplayOrder] = useState('');

  // Form states for new dynamic option set
  const [newDynamicOptionSetTitle, setNewDynamicOptionSetTitle] = useState('');
  const [newDynamicOptionSetDisplayOrder, setNewDynamicOptionSetDisplayOrder] = useState('');

  // Form states for new interactive element
  const [newElementType, setNewElementType] = useState('button');
  const [newElementLabel, setNewElementLabel] = useState('');
  const [newElementDefaultValue, setNewElementDefaultValue] = useState('');
  const [newElementActionTextActivate, setNewElementActionTextActivate] = useState('');
  const [newElementActionTextDeactivate, setNewElementActionTextDeactivate] = useState('');
  const [newElementIsDefaultSelected, setNewElementIsDefaultSelected] = useState(false);

  // States for editing section
  const [editingSection, setEditingSection] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionDefaultText, setEditSectionDefaultText] = useState('');
  const [editSectionDisplayOrder, setEditSectionDisplayOrder] = useState('');

  // States for editing subsection
  const [editingSubsection, setEditingSubsection] = useState(null);
  const [editSubsectionTitle, setEditSubsectionTitle] = useState('');
  const [editSubsectionDisplayOrder, setEditSubsectionDisplayOrder] = useState('');

  // States for editing dynamic option set
  const [editingDynamicOptionSet, setEditingDynamicOptionSet] = useState(null);
  const [editDynamicOptionSetTitle, setEditDynamicOptionSetTitle] = useState('');
  const [editDynamicOptionSetDisplayOrder, setEditDynamicOptionSetDisplayOrder] = useState('');

  // States for editing interactive element
  const [editingElement, setEditingElement] = useState(null);
  const [editingActionRuleId, setEditingActionRuleId] = useState(null);
  const [editElementType, setEditElementType] = useState('');
  const [editElementLabel, setEditElementLabel] = useState('');
  const [editElementSourceActionId, setEditElementSourceActionId] = useState('');
  const [editElementDefaultValue, setEditElementDefaultValue] = useState('');
  const [editElementActionTextActivate, setEditElementActionTextActivate] = useState('');
  const [editElementActionTextDeactivate, setEditElementActionTextDeactivate] = useState('');
  const [editElementIsDefaultSelected, setEditElementIsDefaultSelected] = useState(false);

  // States for report title configuration (for template creation/editing)
  const [templateName, setTemplateName] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportTitleAlignment, setReportTitleAlignment] = useState('center');
  const [reportTitleUppercase, setReportTitleUppercase] = useState(true);
  const [reportTitleBold, setReportTitleBold] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.getAllTemplateCategories();
      setCategories(response.data);
      // If no categories exist, or if a new template, set a default empty selection
      if (response.data.length === 0) {
        setSelectedCategoryId('');
      } else if (currentTemplate && currentTemplate.category_id) {
        setSelectedCategoryId(currentTemplate.category_id);
      } else {
        setSelectedCategoryId(''); // Default to no selection
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Não foi possível carregar as categorias de laudo.');
    }
  }, [currentTemplate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (templateId) {
        setIsTemplateMode(true);
        setIsNewTemplate(false);
        const response = await api.getTemplateById(templateId);
        setCurrentTemplate(response.data);
        setTemplateName(response.data.name || '');
        setReportTitle(response.data.report_title || '');
        setReportTitleAlignment(response.data.report_title_alignment || 'center');
        setReportTitleUppercase(response.data.report_title_uppercase !== undefined ? response.data.report_title_uppercase : true);
        setReportTitleBold(response.data.report_title_bold !== undefined ? response.data.report_title_bold : true);
        setSelectedCategoryId(response.data.category_id || ''); // Set category for existing template

        const initialReportData = {};
        const initialActiveElements = new Set();
        response.data.sections.forEach(section => {
          initialReportData[section.id] = [section.default_text || ''];
          section.subsections.forEach(subsection => {
            subsection.dynamicOptionSets.forEach(dynamicOptionSet => {
              dynamicOptionSet.elements.forEach(element => {
                if (element.is_default_selected) {
                  initialActiveElements.add(element.source_action_id);
                  // Add the action text for this default selected element to the section's reportData
                  if (element.actionRule && element.actionRule.action_text_on_activate) {
                    const targetSectionId = element.actionRule.target_section_id; // Get target section from actionRule
                    initialReportData[targetSectionId] = initialReportData[targetSectionId] || [];
                    if (!initialReportData[targetSectionId].includes(element.actionRule.action_text_on_activate)) {
                      initialReportData[targetSectionId].push(element.actionRule.action_text_on_activate);
                    }
                  }
                }
              });
            });
          });
        });
        setReportData(initialReportData);
        setActiveElements(initialActiveElements);
        // Set all sections to be open by default
        const initialActiveAccordionItems = response.data.sections.map((_, index) => index + 1);
        setActiveAccordionItem(initialActiveAccordionItems);

      } else if (reportId) {
        setIsTemplateMode(false);
        setIsNewTemplate(false);
        const response = await api.get(`/api/reports/${reportId}`);
        setCurrentReport(response.data);
        if (response.data.template) {
          setTemplateName(response.data.template.name || '');
          setReportTitle(response.data.template.report_title || '');
          setReportTitleAlignment(response.data.template.report_title_alignment || 'center');
          setReportTitleUppercase(response.data.template.report_title_uppercase !== undefined ? response.data.template.report_title_uppercase : true);
          setReportTitleBold(response.data.template.report_title_bold !== undefined ? response.data.template.report_title_bold : true);
        }
        const dataMap = response.data.reportData.reduce((acc, data) => {
          acc[data.section_id] = [data.content];
          return acc;
        }, {});
        setReportData(dataMap);

        // Initialize activeElements based on default selected elements from the template
        const initialActiveElements = new Set();
        if (response.data.template && response.data.template.sections) {
          response.data.template.sections.forEach(section => {
            section.subsections.forEach(subsection => {
              subsection.dynamicOptionSets.forEach(dynamicOptionSet => {
                dynamicOptionSet.elements.forEach(element => {
                  if (element.is_default_selected) {
                    initialActiveElements.add(element.source_action_id);
                  }
                });
              });
            });
          });
        }
        setActiveElements(initialActiveElements);

        // Set all sections to be open by default for reports too
        const initialActiveAccordionItems = response.data.template.sections.map((_, index) => index + 1);
        setActiveAccordionItem(initialActiveAccordionItems);

      } else { // /laudos/templates/new
        setIsTemplateMode(true);
        setIsNewTemplate(true);
        setCurrentTemplate({
          name: '',
          sections: [],
          report_title: '',
          report_title_alignment: 'center',
          report_title_uppercase: true,
          report_title_bold: true,
          category_id: '', // New template starts with no category selected
        });
        setTemplateName('');
        setReportTitle('');
        setReportTitleAlignment('center');
        setReportTitleUppercase(true);
        setReportTitleBold(true);
        setReportData({});
        setSelectedCategoryId(''); // Ensure no category is selected for new template
        setActiveAccordionItem([]); // No sections initially for new template
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [reportId, templateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSaveTemplate = async () => {
    if (!templateName) {
      alert('O nome do modelo é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const templateToSave = {
        name: templateName,
        category_id: selectedCategoryId || null, // Include selected category ID
        report_title: reportTitle,
        report_title_alignment: reportTitleAlignment,
        report_title_uppercase: reportTitleUppercase,
        report_title_bold: reportTitleBold,
        sections: currentTemplate?.sections || [],
      };

      let response;
      if (isNewTemplate) {
        response = await api.createTemplate(templateToSave);
        navigate(`/laudos/templates/edit/${response.data.id}`, { replace: true });
        alert('Modelo de laudo criado com sucesso!');
      } else {
        response = await api.updateTemplate(currentTemplate.id, templateToSave);
        alert('Modelo de laudo atualizado com sucesso!');
      }
      setCurrentTemplate(response.data);
    } catch (err) {
      console.error('Erro ao salvar o template:', err);
      setError('Não foi possível salvar o modelo de laudo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('O nome da categoria é obrigatório.');
      return;
    }
    try {
      const response = await api.createTemplateCategory({ name: newCategoryName });
      setCategories(prev => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCategoryId(response.data.id); // Select the newly created category
      setNewCategoryName('');
      setShowAddCategoryModal(false);
      alert('Categoria criada com sucesso!');
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      if (err.response && err.response.status === 409) {
        alert('Já existe uma categoria com este nome.');
      } else {
        alert('Não foi possível criar a categoria.');
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) {
      alert('Selecione uma categoria para excluir.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir esta categoria? Modelos de laudo associados a ela ficarão sem categoria.')) {
      return;
    }
    try {
      await api.deleteTemplateCategory(selectedCategoryId);
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategoryId));
      setSelectedCategoryId(''); // Deselect after deletion
      setShowDeleteCategoryModal(false);
      alert('Categoria excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      alert('Não foi possível excluir a categoria. Verifique se há modelos de laudo ainda associados a ela.');
    }
  };

  // Function to handle action button click (only for report mode)
  const handleActionClick = async (sourceActionId, targetSectionId) => {
    if (isTemplateMode) return; // Actions are for reports, not template editing

    const currentlyActive = activeElements.has(sourceActionId);
    const newIsActive = !currentlyActive; // Alterna o estado

    console.log(`Ação disparada: ${sourceActionId}, Novo estado: ${newIsActive}`);
    try {
      const response = await api.post('/api/reports/evaluate-action', {
        templateId: currentReport.template.id,
        sourceActionId: sourceActionId,
        isActive: newIsActive,
      });
      
      setReportData(prevReportData => {
        const newReportData = { ...prevReportData };
        response.data.updates.forEach(update => {
          const sectionContentArray = newReportData[update.targetSectionId] || [];
          if (newIsActive) {
            // Add text if activating and not already present
            if (!sectionContentArray.includes(update.actionText)) {
              newReportData[update.targetSectionId] = [...sectionContentArray, update.actionText];
            }
          } else {
            // Remove text if deactivating
            newReportData[update.targetSectionId] = sectionContentArray.filter(text => text !== update.actionText);
          }
        });
        return newReportData;
      });

      setActiveElements(prev => {
        const newSet = new Set(prev);
        if (newIsActive) {
          newSet.add(sourceActionId);
        } else {
          newSet.delete(sourceActionId);
        }
        return newSet;
      });

    } catch (err) {
      console.error('Erro ao avaliar a ação:', err);
    }
  };

  // Handle section click in Column 1
  const handleSectionClick = (sectionId) => {
    setSelectedSectionId(sectionId);
    setSelectedSubsectionId(null); // Hide dynamic options when a section is clicked
  };

  // Handle subsection click in Column 1
  const handleSubsectionClick = (sectionId, subsectionId) => {
    setSelectedSectionId(sectionId);
    setSelectedSubsectionId(subsectionId);
  };

  // Helper to get the current template ID, whether in template or report mode
  const getCurrentTemplateId = () => {
    if (isTemplateMode && currentTemplate) return currentTemplate.id;
    if (!isTemplateMode && currentReport && currentReport.template) return currentReport.template.id;
    return null;
  };

  // Handle creating a new section
  const handleCreateSection = async () => {
    const templateIdToUse = getCurrentTemplateId();
    if (!templateIdToUse) {
      alert('Por favor, salve o modelo de laudo antes de adicionar seções.');
      return;
    }
    if (!newSectionTitle || newSectionDisplayOrder === '') {
      alert('Título e Ordem de Exibição são obrigatórios para a seção.');
      return;
    }

    try {
      const newSection = {
        title: newSectionTitle,
        default_text: newSectionDefaultText,
        display_order: parseInt(newSectionDisplayOrder),
      };

      const response = await api.post(`/api/templates/${templateIdToUse}/sections`, newSection);
      console.log('Nova seção criada:', response.data);
      // Update currentTemplate or currentReport state based on mode
      if (isTemplateMode) {
        setCurrentTemplate(prev => ({
          ...prev,
          sections: [...(prev.sections || []), { ...response.data, subsections: [] }].sort((a, b) => a.display_order - b.display_order)
        }));
      } else {
        // For report mode, we might need to re-fetch the report or update its template structure
        // For simplicity, re-fetching the entire report for now.
        fetchData();
      }
      setShowAddSectionModal(false);
      resetNewSectionForm();
    }  catch (err) {
      console.error('Erro ao criar seção:', err);
      alert('Erro ao criar seção. Verifique o console.');
    }
  };

  // Handle creating a new subsection
  const handleCreateSubsection = async () => {
    if (!selectedSectionId || !newSubsectionTitle || newSubsectionDisplayOrder === '') {
      alert('Selecione uma seção e preencha Título e Ordem de Exibição para a subseção.');
      return;
    }

    try {
      const newSubsection = {
        title: newSubsectionTitle,
        display_order: parseInt(newSubsectionDisplayOrder),
      };

      const response = await api.post(`/api/templates/sections/${selectedSectionId}/subsections`, newSubsection);
      console.log('Nova subseção criada:', response.data);
      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? { ...section, subsections: [...(section.subsections || []), { ...response.data, dynamicOptionSets: [] }].sort((a, b) => a.display_order - b.display_order) }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setShowAddSubsectionModal(false);
      resetNewSubsectionForm();
    } catch (err) {
      console.error('Erro ao criar subseção:', err);
      alert('Erro ao criar subseção. Verifique o console.');
    }
  };

  // Handle creating a new interactive element
  // Handle creating a new interactive element
  const handleCreateElement = async () => {
    const templateIdToUse = getCurrentTemplateId();
    if (!templateIdToUse) {
      alert('Erro: ID do template não encontrado para criar o elemento interativo.');
      return;
    }
    if (!selectedDynamicOptionSetId || !newElementType || !newElementLabel || !newElementActionTextActivate) {
      alert('Selecione um conjunto de opções dinâmicas e preencha todos os campos obrigatórios para o elemento interativo.');
      return;
    }

    try {
      // 1. Criar o InteractiveElement
      const elementData = {
        // source_action_id will be generated by backend
        type: newElementType,
        label: newElementLabel,
        default_value: newElementDefaultValue || null,
        is_default_selected: newElementIsDefaultSelected,
      };

      const elementResponse = await api.post(`/api/templates/dynamic-option-sets/${selectedDynamicOptionSetId}/elements`, elementData);
      console.log('Novo elemento interativo criado:', elementResponse.data);

      // 2. Criar a ActionRule associada
      const actionRuleData = {
        templateId: templateIdToUse,
        sourceActionId: elementResponse.data.source_action_id, // Use the generated ID
        targetSectionId: selectedSectionId, // Still targets the section
        action_text_on_activate: newElementActionTextActivate,
        action_text_on_deactivate: newElementActionTextDeactivate || null,
      };

      const actionRuleResponse = await api.post(`/api/action-rules`, actionRuleData);
      console.log('Nova regra de ação criada:', actionRuleResponse.data);

      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  subsections: section.subsections.map(subsection =>
                    subsection.id === selectedSubsectionId
                      ? {
                          ...subsection,
                          dynamicOptionSets: subsection.dynamicOptionSets.map(dynamicOptionSet =>
                            dynamicOptionSet.id === selectedDynamicOptionSetId
                              ? { ...dynamicOptionSet, elements: [...(dynamicOptionSet.elements || []), elementResponse.data] }
                              : dynamicOptionSet
                          ),
                        }
                      : subsection
                  ),
                }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setShowAddElementModal(false);
      resetNewElementForm();
    } catch (err) {
      console.error('Erro ao criar elemento interativo ou regra de ação:', err);
      if (err.response && err.response.status === 409) {
        alert(err.response.data.message); // Display specific backend message
      } else {
        alert('Erro ao criar elemento interativo ou regra de ação. Verifique o console.');
      }
    }
  };

  // Handle editing a section
  const handleEditSection = (section) => {
    setEditingSection(section);
    setEditSectionTitle(section.title);
    setEditSectionDefaultText(section.default_text || '');
    setEditSectionDisplayOrder(section.display_order);
    setShowEditSectionModal(true);
  };

  // Handle updating a section
  const handleUpdateSection = async () => {
    if (!editingSection || !editSectionTitle || editSectionDisplayOrder === '') {
      alert('Título e Ordem de Exibição são obrigatórios para a seção.');
      return;
    }
    try {
      const updatedSectionData = {
        title: editSectionTitle,
        default_text: editSectionDefaultText,
        display_order: parseInt(editSectionDisplayOrder),
      };
      await api.put(`/api/templates/sections/${editingSection.id}`, updatedSectionData);
      console.log('Seção atualizada:', editingSection.id);
      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === editingSection.id
              ? { ...section, ...updatedSectionData }
              : section
          ).sort((a, b) => a.display_order - b.display_order)
        }));
      } else {
        fetchData();
      }
      setShowEditSectionModal(false);
      setEditingSection(null);
    } catch (err) {
      console.error('Erro ao atualizar seção:', err);
      alert('Erro ao atualizar seção. Verifique o console.');
    }
  };

  // Handle deleting a section
  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta seção e todas as suas subseções e elementos interativos?')) {
      return;
    }
    try {
      await api.delete(`/api/templates/sections/${sectionId}`);
      console.log('Seção excluída:', sectionId);
      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.filter(section => section.id !== sectionId)
        }));
      } else {
        fetchData();
      }
      setSelectedSectionId(null); // Deselect if deleted
      setSelectedSubsectionId(null);
    } catch (err) {
      console.error('Erro ao excluir seção:', err);
      alert('Erro ao excluir seção. Verifique o console.');
    }
  };

  // Handle editing a subsection
  const handleEditSubsection = (subsection) => {
    setEditingSubsection(subsection);
    setEditSubsectionTitle(subsection.title);
    setEditSubsectionDisplayOrder(subsection.display_order);
    setShowEditSubsectionModal(true);
  };

  // Handle updating a subsection
  const handleUpdateSubsection = async () => {
    if (!editingSubsection || !editSubsectionTitle || editSubsectionDisplayOrder === '') {
      alert('Título e Ordem de Exibição são obrigatórios para a subseção.');
      return;
    }
    try {
      const updatedSubsectionData = {
        title: editSubsectionTitle,
        display_order: parseInt(editSubsectionDisplayOrder),
      };
      await api.put(`/api/templates/subsections/${editingSubsection.id}`, updatedSubsectionData);
      console.log('Subseção atualizada:', editingSubsection.id);
      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  subsections: section.subsections.map(subsection =>
                    subsection.id === editingSubsection.id
                      ? { ...subsection, ...updatedSubsectionData, dynamicOptionSets: subsection.dynamicOptionSets } // Preserve dynamicOptionSets
                      : subsection
                  ).sort((a, b) => a.display_order - b.display_order),
                }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setShowEditSubsectionModal(false);
      setEditingSubsection(null);
    } catch (err) {
      console.error('Erro ao atualizar subseção:', err);
      alert('Erro ao atualizar subseção. Verifique o console.');
    }
  };

  // Handle deleting a subsection
  const handleDeleteSubsection = async (subsectionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta subseção e todos os seus conjuntos de opções dinâmicas e elementos interativos?')) {
      return;
    }
    try {
      await api.delete(`/api/templates/subsections/${subsectionId}`);
      console.log('Subseção excluída:', subsectionId);
      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? { ...section, subsections: section.subsections.filter(subsection => subsection.id !== subsectionId) }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setSelectedSubsectionId(null); // Deselect if deleted
      setSelectedDynamicOptionSetId(null); // Deselect if deleted
    } catch (err) {
      console.error('Erro ao excluir subseção:', err);
      alert('Erro ao excluir subseção. Verifique o console.');
    }
  };

  // Handle editing an interactive element
  const handleEditElement = async (element) => {
    setEditingElement(element);
    setEditElementType(element.type);
    setEditElementLabel(element.label);
    setEditElementSourceActionId(element.source_action_id);
    setEditElementDefaultValue(element.default_value || '');
    setEditElementIsDefaultSelected(element.is_default_selected || false);

    const templateIdToUse = getCurrentTemplateId();
    if (!templateIdToUse) {
      alert('Erro: ID do template não encontrado para buscar a regra de ação.');
      return;
    }

    // Fetch the associated ActionRule to pre-fill its fields
    try {
      const response = await api.get(`/api/action-rules?templateId=${templateIdToUse}&sourceActionId=${element.source_action_id}`);
      if (response.data.length > 0) {
        const actionRule = response.data[0]; // Assuming one action rule per element for now
        setEditingActionRuleId(actionRule.id);
        setEditElementActionTextActivate(actionRule.action_text_on_activate || '');
        setEditElementActionTextDeactivate(actionRule.action_text_on_deactivate || '');
      } else {
        // Handle case where no action rule is found (e.g., old data or error)
        setEditingActionRuleId(null);
        setEditElementActionTextActivate('');
        setEditElementActionTextDeactivate('');
      }
    } catch (err) {
      console.error('Erro ao buscar regra de ação para edição:', err);
      alert('Erro ao carregar dados da regra de ação. Verifique o console.');
    }
    setShowEditElementModal(true);
  };

  // Handle updating an interactive element and its action rule
  const handleUpdateElement = async () => {
    const templateIdToUse = getCurrentTemplateId();
    if (!templateIdToUse) {
      alert('Erro: ID do template não encontrado para atualizar o elemento interativo.');
      return;
    }
    if (!editingElement || !editElementSourceActionId || !editElementType || !editElementLabel || !editElementActionTextActivate) {
      alert('Preencha todos os campos obrigatórios para o elemento interativo.');
      return;
    }

    try {
      // 1. Update the InteractiveElement
      const elementData = {
        dynamic_option_set_id: selectedDynamicOptionSetId, // Ensure this is passed if element is moved
        source_action_id: editElementSourceActionId,
        type: editElementType,
        label: editElementLabel,
        default_value: editElementDefaultValue || null,
        is_default_selected: editElementIsDefaultSelected,
      };
      await api.put(`/api/templates/elements/${editingElement.id}`, elementData);
      console.log('Elemento interativo atualizado:', editingElement.id);

      // 2. Update the associated ActionRule
      if (editingActionRuleId) {
        const actionRuleData = {
          sourceActionId: editElementSourceActionId,
          targetSectionId: selectedSectionId, // Assuming the action affects the parent section of the subsection
          action_text_on_activate: editElementActionTextActivate,
          action_text_on_deactivate: editElementActionTextDeactivate || null,
        };
        await api.put(`/api/action-rules/${editingActionRuleId}`, actionRuleData);
        console.log('Regra de ação atualizada:', editingActionRuleId);
      } else {
        // If no action rule was found for editing, create a new one
        const actionRuleData = {
          templateId: templateIdToUse,
          sourceActionId: editElementSourceActionId,
          targetSectionId: selectedSectionId,
          action_text_on_activate: editElementActionTextActivate,
          action_text_on_deactivate: editElementActionTextDeactivate || null,
        };
        await api.post(`/api/action-rules`, actionRuleData);
        console.log('Nova regra de ação criada durante a edição:', editElementSourceActionId);
      }

      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  subsections: section.subsections.map(subsection =>
                    subsection.id === selectedSubsectionId
                      ? {
                          ...subsection,
                          dynamicOptionSets: subsection.dynamicOptionSets.map(dynamicOptionSet =>
                            dynamicOptionSet.id === selectedDynamicOptionSetId
                              ? {
                                  ...dynamicOptionSet,
                                  elements: dynamicOptionSet.elements.map(element =>
                                    element.id === editingElement.id
                                      ? { ...element, ...elementData }
                                      : element
                                  ),
                                }
                              : dynamicOptionSet
                          ),
                        }
                      : subsection
                  ),
                }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setShowEditElementModal(false);
      setEditingElement(null);
      setEditingActionRuleId(null);
    } catch (err) {
      console.error('Erro ao atualizar elemento interativo ou regra de ação:', err);
      alert('Erro ao atualizar elemento interativo ou regra de ação. Verifique o console.');
    }
  };

  // Handle deleting an interactive element and its action rule
  const handleDeleteElement = async (elementId, sourceActionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta opção dinâmica e sua regra de ação associada?')) {
      return;
    }
    const templateIdToUse = getCurrentTemplateId();
    if (!templateIdToUse) {
      alert('Erro: ID do template não encontrado para excluir a regra de ação.');
      return;
    }

    try {
      // 1. Delete the InteractiveElement
      await api.delete(`/api/templates/elements/${elementId}`);
      console.log('Elemento interativo excluído:', elementId);

      // 2. Delete the associated ActionRule (find by sourceActionId)
      const response = await api.get(`/api/action-rules?templateId=${templateIdToUse}&sourceActionId=${sourceActionId}`);
      if (response.data.length > 0) {
        const actionRuleIdToDelete = response.data[0].id;
        await api.delete(`/api/action-rules/${actionRuleIdToDelete}`);
        console.log('Regra de ação excluída:', actionRuleIdToDelete);
      }

      // Update state directly for better UX
      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  subsections: section.subsections.map(subsection =>
                    subsection.id === selectedSubsectionId
                      ? {
                          ...subsection,
                          dynamicOptionSets: subsection.dynamicOptionSets.map(dynamicOptionSet =>
                            dynamicOptionSet.id === selectedDynamicOptionSetId
                              ? { ...dynamicOptionSet, elements: dynamicOptionSet.elements.filter(element => element.id !== elementId) }
                              : dynamicOptionSet
                          ),
                        }
                      : subsection
                  ),
                }
              : section
          ),
        }));
      } else {
        fetchData();
      }
    } catch (err) {
      console.error('Erro ao excluir elemento interativo ou regra de ação:', err);
      alert('Erro ao excluir elemento interativo ou regra de ação. Verifique o console.');
    }
  };

  // Handle creating a new dynamic option set
  const handleAddDynamicOptionSet = async () => {
    if (!selectedSubsectionId || !newDynamicOptionSetTitle || newDynamicOptionSetDisplayOrder === '') {
      alert('Selecione uma subseção e preencha Título e Ordem de Exibição para o conjunto de opções dinâmicas.');
      return;
    }

    try {
      const newDynamicOptionSet = {
        title: newDynamicOptionSetTitle,
        display_order: parseInt(newDynamicOptionSetDisplayOrder),
        elements: [], // Initialize with empty elements array
      };

      const response = await api.post(`/api/templates/subsections/${selectedSubsectionId}/dynamic-option-sets`, newDynamicOptionSet);
      console.log('Novo conjunto de opções dinâmicas criado:', response.data);

      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  subsections: section.subsections.map(subsection =>
                    subsection.id === selectedSubsectionId
                      ? { ...subsection, dynamicOptionSets: [...(subsection.dynamicOptionSets || []), response.data].sort((a, b) => a.display_order - b.display_order) }
                      : subsection
                  ),
                }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setShowAddDynamicOptionSetModal(false);
      resetNewDynamicOptionSetForm();
    } catch (err) {
      console.error('Erro ao criar conjunto de opções dinâmicas:', err);
      alert('Erro ao criar conjunto de opções dinâmicas. Verifique o console.');
    }
  };

  // Handle editing a dynamic option set
  const handleEditDynamicOptionSet = (dynamicOptionSet) => {
    setEditingDynamicOptionSet(dynamicOptionSet);
    setEditDynamicOptionSetTitle(dynamicOptionSet.title);
    setEditDynamicOptionSetDisplayOrder(dynamicOptionSet.display_order);
    setShowEditDynamicOptionSetModal(true);
  };

  // Handle updating a dynamic option set
  const handleUpdateDynamicOptionSet = async () => {
    if (!editingDynamicOptionSet || !editDynamicOptionSetTitle || editDynamicOptionSetDisplayOrder === '') {
      alert('Título e Ordem de Exibição são obrigatórios para o conjunto de opções dinâmicas.');
      return;
    }
    try {
      const updatedDynamicOptionSetData = {
        title: editDynamicOptionSetTitle,
        display_order: parseInt(editDynamicOptionSetDisplayOrder),
      };
      await api.put(`/api/templates/dynamic-option-sets/${editingDynamicOptionSet.id}`, updatedDynamicOptionSetData);
      console.log('Conjunto de opções dinâmicas atualizado:', editingDynamicOptionSet.id);

      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  subsections: section.subsections.map(subsection =>
                    subsection.id === selectedSubsectionId
                      ? {
                          ...subsection,
                          dynamicOptionSets: subsection.dynamicOptionSets.map(dynamicOptionSet =>
                            dynamicOptionSet.id === editingDynamicOptionSet.id
                              ? { ...dynamicOptionSet, ...updatedDynamicOptionSetData }
                              : dynamicOptionSet
                          ).sort((a, b) => a.display_order - b.display_order),
                        }
                      : subsection
                  ),
                }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setShowEditDynamicOptionSetModal(false);
      setEditingDynamicOptionSet(null);
    } catch (err) {
      console.error('Erro ao atualizar conjunto de opções dinâmicas:', err);
      alert('Erro ao atualizar conjunto de opções dinâmicas. Verifique o console.');
    }
  };

  // Handle deleting a dynamic option set
  const handleDeleteDynamicOptionSet = async (dynamicOptionSetId) => {
    if (!window.confirm('Tem certeza que deseja excluir este conjunto de opções dinâmicas e todos os seus elementos interativos?')) {
      return;
    }
    try {
      await api.delete(`/api/templates/dynamic-option-sets/${dynamicOptionSetId}`);
      console.log('Conjunto de opções dinâmicas excluído:', dynamicOptionSetId);

      if (isTemplateMode) {
        setCurrentTemplate(prevTemplate => ({
          ...prevTemplate,
          sections: prevTemplate.sections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  subsections: section.subsections.map(subsection =>
                    subsection.id === selectedSubsectionId
                      ? { ...subsection, dynamicOptionSets: subsection.dynamicOptionSets.filter(dynamicOptionSet => dynamicOptionSet.id !== dynamicOptionSetId) }
                      : subsection
                  ),
                }
              : section
          ),
        }));
      } else {
        fetchData();
      }
      setSelectedDynamicOptionSetId(null); // Deselect if deleted
    } catch (err) {
      console.error('Erro ao excluir conjunto de opções dinâmicas:', err);
      alert('Erro ao excluir conjunto de opções dinâmicas. Verifique o console.');
    }
  };

  // Reset form fields for new section
  const resetNewSectionForm = () => {
    setNewSectionTitle('');
    setNewSectionDefaultText('');
    setNewSectionDisplayOrder('');
  };

  // Reset form fields for new subsection
  const resetNewSubsectionForm = () => {
    setNewSubsectionTitle('');
    setNewSubsectionDisplayOrder('');
  };

  // Reset form fields for new dynamic option set
  const resetNewDynamicOptionSetForm = () => {
    setNewDynamicOptionSetTitle('');
    setNewDynamicOptionSetDisplayOrder('');
  };

  // Reset form fields for new interactive element
  const resetNewElementForm = () => {
    setNewElementType('button');
    setNewElementLabel('');
    setNewElementDefaultValue('');
    setNewElementActionTextActivate('');
    setNewElementActionTextDeactivate('');
    setNewElementIsDefaultSelected(false);
  };

  // Handle copying the final report content (formatted HTML)
  const handleCopyReport = async () => {
    try {
      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderFinalContent();

      // Use the Clipboard API to write HTML content
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([tempDiv.innerHTML], { type: 'text/html' }),
        'text/plain': new Blob([tempDiv.textContent], { type: 'text/plain' })
      })]);
      alert('Laudo copiado com formatação para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar laudo com formatação:', err);
      alert('Não foi possível copiar o laudo com formatação.');
    }
  };

  // Handle copying the final report content as plain text
  const handleCopyPlainText = async () => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderFinalContent();
      await navigator.clipboard.writeText(tempDiv.textContent);
      alert('Laudo copiado sem formatação para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar laudo sem formatação:', err);
      alert('Não foi possível copiar o laudo sem formatação.');
    }
  };

  // Handle copying the final report content with line breaks
  const handleCopyWithLineBreaks = async () => {
    try {
      let content = renderFinalContent();
      // Replace block-level HTML tags with newlines for better plain text representation
      content = content.replace(/<h1[^>]*>.*?<\/h1>/gi, match => match.replace(/<\/h1>/, '\n\n'));
      content = content.replace(/<p[^>]*>.*?<\/p>/gi, match => match.replace(/<\/p>/, '\n'));
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      await navigator.clipboard.writeText(tempDiv.textContent);
      alert('Laudo copiado com quebra de linha para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar laudo com quebra de linha:', err);
      alert('Não foi possível copiar o laudo com quebra de linha.');
    }
  };

  // Render the final report content for Column 3
  const renderFinalContent = () => {
    const dataToRender = isTemplateMode ? currentTemplate : currentReport?.template;
    if (!dataToRender) return '';

    let finalContent = '';

    // Render main report title
    if (dataToRender.report_title) {
      let titleStyle = {};
      if (dataToRender.report_title_alignment === 'center') {
        titleStyle.textAlign = 'center';
      } else if (dataToRender.report_title_alignment === 'right') {
        titleStyle.textAlign = 'right';
      } else {
        titleStyle.textAlign = 'left';
      }

      let titleText = dataToRender.report_title;
      if (dataToRender.report_title_uppercase) {
        titleText = titleText.toUpperCase();
      }

      if (dataToRender.report_title_bold) {
        finalContent += `<h1 style="text-align: ${titleStyle.textAlign}; font-weight: bold; font-size: 14pt; line-height: 1.5;">${titleText}</h1>\n`;
      } else {
        finalContent += `<h1 style="text-align: ${titleStyle.textAlign}; font-size: 14pt; line-height: 1.5;">${titleText}</h1>\n`;
      }
    }

    // Render sections and their content
    finalContent += dataToRender.sections
      .sort((a, b) => a.display_order - b.display_order)
      .map(section => {
        const sectionTitle = section.title.toUpperCase();
        const sectionContent = (reportData[section.id] && reportData[section.id].length > 0)
          ? reportData[section.id].join('<br />') // Join with <br /> for new line in HTML
          : section.default_text || '';
        return `<p style="font-weight: bold; font-size: 12pt; line-height: 1.5;">${sectionTitle}</p><p style="font-size: 12pt; line-height: 1.5; text-align: justify;">${sectionContent}</p>`;
      })
      .join('\n');

    return finalContent;
  };

  const displayEntity = isTemplateMode ? currentTemplate : currentReport;

  if (loading) {
    return <div className="pt-3 text-center"><CSpinner /></div>;
  }

  if (error) {
    return <CAlert color="danger" className="text-center mt-3">{error}</CAlert>;
  }

  if (!displayEntity && !isNewTemplate) {
    return <CAlert color="info" className="text-center mt-3">Nenhum dado para exibir. Verifique o ID na URL.</CAlert>;
  }

  // Find the currently selected section and subsection objects
  const sectionsToDisplay = (isTemplateMode ? currentTemplate?.sections : currentReport?.template?.sections) || [];
  const currentSelectedSection = sectionsToDisplay?.find(s => s.id === selectedSectionId);
  const currentSelectedSubsection = currentSelectedSection?.subsections.find(ss => ss.id === selectedSubsectionId);

  // Filter sections/subsections for Column 2 based on selection
  const getFilteredInteractiveElements = () => {
    if (!sectionsToDisplay || !selectedSubsectionId) return []; // Only show elements if a subsection is selected

    let elementsToDisplay = [];

    // If a subsection is selected, find its elements
    const section = sectionsToDisplay.find(s => s.id === selectedSectionId);
    if (section) {
      const subsection = section.subsections.find(ss => ss.id === selectedSubsectionId);
      if (subsection) {
        elementsToDisplay = subsection.elements || [];
      }
    }
    return elementsToDisplay;
  };

  const getFilteredDynamicOptionSets = () => {
    if (!currentSelectedSubsection) return [];
    return currentSelectedSubsection.dynamicOptionSets || [];
  };

  const getElementsInDynamicOptionSet = (dynamicOptionSetId) => {
    const dynamicOptionSet = getFilteredDynamicOptionSets().find(dos => dos.id === dynamicOptionSetId);
    return dynamicOptionSet ? dynamicOptionSet.elements || [] : [];
  };

  const filteredElements = getFilteredInteractiveElements();

  return (
    <CContainer fluid>
      <CRow>
        {/* Template/Report Name and Save Button */}
        {isTemplateMode && (
          <CCol xs={12} className="mb-3">
            <CCard>
              <CCardHeader>
                <CRow className="align-items-center">
                  <CCol>
                    <CFormLabel htmlFor="templateName" className="mb-0 me-2">Nome do Modelo:</CFormLabel>
                    <CFormInput
                      type="text"
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Nome do Modelo de Laudo"
                      className="d-inline-block w-auto"
                    />
                  </CCol>
                  <CCol xs="auto">
                    <CButton color="success" onClick={handleSaveTemplate}>
                      Salvar Modelo
                    </CButton>
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody>
                <h6>Configurações do Título do Laudo</h6>
                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="reportTitle">Título Principal do Laudo (Opcional)</CFormLabel>
                      <CFormInput
                        type="text"
                        id="reportTitle"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder="Ex: Tomografia Computadorizada de Crânio"
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="reportTitleAlignment">Alinhamento do Título</CFormLabel>
                      <CFormSelect
                        id="reportTitleAlignment"
                        value={reportTitleAlignment}
                        onChange={(e) => setReportTitleAlignment(e.target.value)}
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </CFormSelect>
                    </div>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormCheck
                        id="reportTitleUppercase"
                        label="Título em Caixa Alta"
                        checked={reportTitleUppercase}
                        onChange={(e) => setReportTitleUppercase(e.target.checked)}
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormCheck
                        id="reportTitleBold"
                        label="Título em Negrito"
                        checked={reportTitleBold}
                        onChange={(e) => setReportTitleBold(e.target.checked)}
                      />
                    </div>
                  </CCol>
                </CRow>
                <hr />
                <h6>Categoria do Laudo</h6>
                <CRow className="align-items-center">
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="templateCategory">Selecionar Categoria</CFormLabel>
                      <CFormSelect
                        id="templateCategory"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                      >
                        <option value="">Nenhuma Categoria</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                  </CCol>
                  <CCol md={6} className="d-flex gap-2">
                    <CButton color="primary" onClick={() => setShowAddCategoryModal(true)}>
                      Criar Nova Categoria
                    </CButton>
                    <CButton color="danger" onClick={() => setShowDeleteCategoryModal(true)} disabled={!selectedCategoryId}>
                      Excluir Categoria Selecionada
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        )}

        {/* Coluna 1: Seções e Subseções */}
        <CCol md={isTemplateMode ? 4 : 3}>
          <CCard>
            <CCardHeader>
              Estrutura do {isTemplateMode ? 'Modelo' : 'Laudo'}
              {isTemplateMode && currentTemplate?.id && (
                <CButton color="primary" size="sm" className="float-end" onClick={() => setShowAddSectionModal(true)}>
                  Adicionar Seção
                </CButton>
              )}
              {isTemplateMode && !currentTemplate?.id && (
                <span className="float-end text-muted">Salve o modelo para adicionar seções</span>
              )}
            </CCardHeader>
            <CCardBody>
              <CAccordion activeItemKey={activeAccordionItem} onShow={(key) => setActiveAccordionItem(key)} alwaysOpen>
                {(isTemplateMode ? currentTemplate?.sections : currentReport?.template?.sections)?.map((section, index) => (
                  <CAccordionItem key={section.id} itemKey={index + 1}>
                    <CAccordionHeader onClick={() => handleSectionClick(section.id, index + 1)}>
                      {section.title}
                      {isTemplateMode && (
                        <div className="ms-auto">
                          <span
                            className="btn btn-info btn-sm ms-1 px-2 py-1 border-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSection(section);
                            }}
                          >
                            <CIcon icon={cilPencil} />
                          </span>
                          <span
                            className="btn btn-danger btn-sm ms-1 px-2 py-1 border-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(section.id);
                            }}
                          >
                            <CIcon icon={cilTrash} />
                          </span>
                          <span
                            className="btn btn-success btn-sm ms-1 px-2 py-1 border-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSectionId(section.id);
                              setSelectedSubsectionId(null);
                              setShowAddSubsectionModal(true);
                            }}
                          >
                            <CIcon icon={cilPlus} />
                          </span>
                        </div>
                      )}
                    </CAccordionHeader>
                    <CAccordionBody>
                      {(section.subsections || []).length > 0 && (
                        <CListGroup className="mt-2">
                          {section.subsections.map((subsection) => (
                            <CListGroupItem
                              key={subsection.id}
                              component="a"
                              href="#"
                              onClick={() => handleSubsectionClick(section.id, subsection.id)}
                              active={selectedSubsectionId === subsection.id}
                              className="position-relative"
                            >
                              {subsection.title}
                              {isTemplateMode && (
                                <div className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-transparent" style={{ zIndex: 1 }}>
                                  <span
                                  className="btn btn-info btn-sm ms-1 px-2 py-1 border-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSubsection(subsection);
                                  }}
                                >
                                  <CIcon icon={cilPencil} />
                                </span>
                                <span
                                  className="btn btn-danger btn-sm ms-1 px-2 py-1 border-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubsection(subsection.id);
                                  }}
                                >
                                  <CIcon icon={cilTrash} />
                                </span>
                                </div>
                              )}
                            </CListGroupItem>
                          ))}
                        </CListGroup>
                      )}
                    </CAccordionBody>
                  </CAccordionItem>
                ))}
              </CAccordion>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Coluna 2: Opções Interativas */}
        <CCol md={isTemplateMode ? 4 : 4}>
          <CCard>
            <CCardHeader>Opções Dinâmicas</CCardHeader>
            <CCardBody>
              {!selectedSectionId && (
                <p>Selecione uma seção na coluna 1 para ver as opções.</p>
              )}
              {selectedSectionId && !selectedSubsectionId && (
                <p>Selecione uma subseção para adicionar conjuntos de opções dinâmicas.</p>
              )}
              {selectedSubsectionId && isTemplateMode && (
                <CButton color="primary" size="sm" className="mb-3" onClick={() => setShowAddDynamicOptionSetModal(true)}>
                  Adicionar Conjunto de Opções
                </CButton>
              )}

              {getFilteredDynamicOptionSets().length > 0 && (
                <CAccordion activeItemKey={activeAccordionItem} onShow={(key) => setActiveAccordionItem(key)} alwaysOpen>
                  {getFilteredDynamicOptionSets().map((dynamicOptionSet, dosIndex) => (
                    <CAccordionItem key={dynamicOptionSet.id} itemKey={`dos-${dosIndex + 1}`}>
                      <CAccordionHeader onClick={() => setSelectedDynamicOptionSetId(dynamicOptionSet.id)}>
                        {dynamicOptionSet.title}
                        {isTemplateMode && (
                          <div className="ms-auto">
                            <span
                              className="btn btn-info btn-sm ms-1 px-2 py-1 border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDynamicOptionSet(dynamicOptionSet);
                              }}
                            >
                              <CIcon icon={cilPencil} />
                            </span>
                            <span
                              className="btn btn-danger btn-sm ms-1 px-2 py-1 border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDynamicOptionSet(dynamicOptionSet.id);
                              }}
                            >
                              <CIcon icon={cilTrash} />
                            </span>
                            <span
                              className="btn btn-success btn-sm ms-1 px-2 py-1 border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDynamicOptionSetId(dynamicOptionSet.id);
                                setShowAddElementModal(true);
                              }}
                            >
                              <CIcon icon={cilPlus} />
                            </span>
                          </div>
                        )}
                      </CAccordionHeader>
                      <CAccordionBody>
                        {getElementsInDynamicOptionSet(dynamicOptionSet.id).length > 0 && (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {getElementsInDynamicOptionSet(dynamicOptionSet.id).map((element) => (
                              <CButton
                                key={element.id}
                                color={activeElements.has(element.source_action_id) ? "success" : "primary"}
                                onClick={!isTemplateMode ? () => handleActionClick(element.source_action_id, selectedSectionId) : undefined}
                                className="position-relative"
                              >
                                {element.label}
                                {isTemplateMode && (
                                  <div className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-transparent" style={{ zIndex: 1 }}>
                                    <span
                                      className="btn btn-info btn-sm ms-1 px-2 py-1 border-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDynamicOptionSetId(dynamicOptionSet.id); // Ensure DOS is selected for element editing
                                        handleEditElement(element);
                                      }}
                                    >
                                      <CIcon icon={cilPencil} />
                                    </span>
                                    <span
                                      className="btn btn-danger btn-sm ms-1 px-2 py-1 border-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDynamicOptionSetId(dynamicOptionSet.id); // Ensure DOS is selected for element deletion
                                        handleDeleteElement(element.id, element.source_action_id);
                                      }}
                                    >
                                      <CIcon icon={cilTrash} />
                                    </span>
                                  </div>
                                )}
                              </CButton>
                            ))}
                          </div>
                        )}
                      </CAccordionBody>
                    </CAccordionItem>
                  ))}
                </CAccordion>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Coluna 3: Laudo Final */}
        <CCol md={isTemplateMode ? 4 : 5}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              {isTemplateMode ? 'Pré-visualização do Modelo' : 'Laudo Final'}
              {!isTemplateMode && (
                <CButtonGroup>
                  <CButton color="primary" onClick={handleCopyReport}>
                    Copiar
                  </CButton>
                  <CDropdown variant="btn-group">
                    <CDropdownToggle color="primary">
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={handleCopyPlainText}>Copiar sem formatação</CDropdownItem>
                      <CDropdownItem onClick={handleCopyWithLineBreaks}>Copiar com quebra de linha</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CButtonGroup>
              )}
            </CCardHeader>
            <CCardBody>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Arial' }} dangerouslySetInnerHTML={{ __html: renderFinalContent() }} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal para Adicionar Seção */}
      <CModal visible={showAddSectionModal} onClose={() => setShowAddSectionModal(false)}>
        <CModalHeader onClose={() => setShowAddSectionModal(false)}>
          Adicionar Nova Seção
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="newSectionTitle">Título da Seção</CFormLabel>
            <CFormInput
              type="text"
              id="newSectionTitle"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Ex: Técnica, Análise, Impressão"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="newSectionDefaultText">Texto Padrão (Opcional)</CFormLabel>
            <CFormTextarea
              id="newSectionDefaultText"
              value={newSectionDefaultText}
              onChange={(e) => setNewSectionDefaultText(e.target.value)}
              rows="3"
              placeholder="Texto inicial para esta seção no laudo."
            ></CFormTextarea>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="newSectionDisplayOrder">Ordem de Exibição</CFormLabel>
            <CFormInput
              type="number"
              id="newSectionDisplayOrder"
              value={newSectionDisplayOrder}
              onChange={(e) => setNewSectionDisplayOrder(e.target.value)}
              placeholder="Ex: 1, 2, 3"
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddSectionModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreateSection}>
            Criar Seção
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para Adicionar Subseção */}
      <CModal visible={showAddSubsectionModal} onClose={() => setShowAddSubsectionModal(false)}>
        <CModalHeader onClose={() => setShowAddSubsectionModal(false)}>
          Adicionar Nova Subseção à {currentSelectedSection?.title}
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="newSubsectionTitle">Título da Subseção</CFormLabel>
            <CFormInput
              type="text"
              id="newSubsectionTitle"
              value={newSubsectionTitle}
              onChange={(e) => setNewSubsectionTitle(e.target.value)}
              placeholder="Ex: Equipamento, Achados, Conclusão"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="newSubsectionDisplayOrder">Ordem de Exibição</CFormLabel>
            <CFormInput
              type="number"
              id="newSubsectionDisplayOrder"
              value={newSubsectionDisplayOrder}
              onChange={(e) => setNewSubsectionDisplayOrder(e.target.value)}
              placeholder="Ex: 1, 2, 3"
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddSubsectionModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreateSubsection}>
            Criar Subseção
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para Adicionar Conjunto de Opções Dinâmicas */}
      <CModal visible={showAddDynamicOptionSetModal} onClose={() => setShowAddDynamicOptionSetModal(false)}>
        <CModalHeader onClose={() => setShowAddDynamicOptionSetModal(false)}>
          Adicionar Novo Conjunto de Opções Dinâmicas à {currentSelectedSubsection?.title}
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="newDynamicOptionSetTitle">Título do Conjunto de Opções</CFormLabel>
            <CFormInput
              type="text"
              id="newDynamicOptionSetTitle"
              value={newDynamicOptionSetTitle}
              onChange={(e) => setNewDynamicOptionSetTitle(e.target.value)}
              placeholder="Ex: Contraste, Aspecto do Fígado"
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="newDynamicOptionSetDisplayOrder">Ordem de Exibição</CFormLabel>
            <CFormInput
              type="number"
              id="newDynamicOptionSetDisplayOrder"
              value={newDynamicOptionSetDisplayOrder}
              onChange={(e) => setNewDynamicOptionSetDisplayOrder(e.target.value)}
              placeholder="Ex: 1, 2, 3"
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddDynamicOptionSetModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleAddDynamicOptionSet}>
            Criar Conjunto
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para Editar Conjunto de Opções Dinâmicas */}
      <CModal visible={showEditDynamicOptionSetModal} onClose={() => setShowEditDynamicOptionSetModal(false)}>
        <CModalHeader onClose={() => setShowEditDynamicOptionSetModal(false)}>
          Editar Conjunto de Opções Dinâmicas
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="editDynamicOptionSetTitle">Título do Conjunto de Opções</CFormLabel>
            <CFormInput
              type="text"
              id="editDynamicOptionSetTitle"
              value={editDynamicOptionSetTitle}
              onChange={(e) => setEditDynamicOptionSetTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editDynamicOptionSetDisplayOrder">Ordem de Exibição</CFormLabel>
            <CFormInput
              type="number"
              id="editDynamicOptionSetDisplayOrder"
              value={editDynamicOptionSetDisplayOrder}
              onChange={(e) => setEditDynamicOptionSetDisplayOrder(e.target.value)}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditDynamicOptionSetModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateDynamicOptionSet}>
            Atualizar Conjunto
          </CButton>
        </CModalFooter>
      </CModal>
      

      {/* Modal para Adicionar Elemento Interativo */}
      <CModal visible={showAddElementModal} onClose={() => setShowAddElementModal(false)}>
        <CModalHeader onClose={() => setShowAddElementModal(false)}>
          Adicionar Opção Dinâmica à {currentSelectedSubsection?.title}
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="newElementType">Tipo de Elemento</CFormLabel>
            <CFormSelect
              id="newElementType"
              value={newElementType}
              onChange={(e) => setNewElementType(e.target.value)}
            >
              <option value="button">Botão</option>
              {/* Adicionar outros tipos conforme necessário: checkbox, text_input */}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="newElementLabel">Rótulo (Texto do Botão/Opção)</CFormLabel>
            <CFormInput
              type="text"
              id="newElementLabel"
              value={newElementLabel}
              onChange={(e) => setNewElementLabel(e.target.value)}
              placeholder="Ex: Nódulo Benigno, Cisto Simples"
            />
          </div>
          
          <div className="mb-3">
            <CFormLabel htmlFor="newElementActionTextActivate">Texto ao Ativar</CFormLabel>
            <CFormTextarea
              id="newElementActionTextActivate"
              value={newElementActionTextActivate}
              onChange={(e) => setNewElementActionTextActivate(e.target.value)}
              rows="3"
              placeholder="Texto a ser adicionado/substituído quando ativado."
            ></CFormTextarea>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="newElementActionTextDeactivate">Texto ao Desativar (Opcional)</CFormLabel>
            <CFormTextarea
              id="newElementActionTextDeactivate"
              value={newElementActionTextDeactivate}
              onChange={(e) => setNewElementActionTextDeactivate(e.target.value)}
              rows="3"
              placeholder="Texto a ser removido/substituído quando desativado."
            ></CFormTextarea>
          </div>
          <div className="mb-3">
            <CFormCheck
              id="newElementIsDefaultSelected"
              label="Autoselecionar?"
              checked={newElementIsDefaultSelected}
              onChange={(e) => setNewElementIsDefaultSelected(e.target.checked)}
            />
          </div>
          {/* Default Value for other types like text_input or checkbox */}
          {newElementType !== 'button' && (
            <div className="mb-3">
              <CFormLabel htmlFor="newElementDefaultValue">Valor Padrão (Opcional)</CFormLabel>
              <CFormInput
                type="text"
                id="newElementDefaultValue"
                value={newElementDefaultValue}
                onChange={(e) => setNewElementDefaultValue(e.target.value)}
                placeholder="Valor inicial para campos de texto ou estado para checkboxes"
              />
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddElementModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreateElement}>
            Criar Opção
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modals for Editing Section, Subsection, Element (similar structure to Add modals) */}
      {/* Edit Section Modal */}
      <CModal visible={showEditSectionModal} onClose={() => setShowEditSectionModal(false)}>
        <CModalHeader onClose={() => setShowEditSectionModal(false)}>
          Editar Seção
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="editSectionTitle">Título da Seção</CFormLabel>
            <CFormInput
              type="text"
              id="editSectionTitle"
              value={editSectionTitle}
              onChange={(e) => setEditSectionTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editSectionDefaultText">Texto Padrão (Opcional)</CFormLabel>
            <CFormTextarea
              id="editSectionDefaultText"
              value={editSectionDefaultText}
              onChange={(e) => setEditSectionDefaultText(e.target.value)}
              rows="3"
            ></CFormTextarea>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editSectionDisplayOrder">Ordem de Exibição</CFormLabel>
            <CFormInput
              type="number"
              id="editSectionDisplayOrder"
              value={editSectionDisplayOrder}
              onChange={(e) => setEditSectionDisplayOrder(e.target.value)}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditSectionModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateSection}>
            Atualizar Seção
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Subsection Modal */}
      <CModal visible={showEditSubsectionModal} onClose={() => setShowEditSubsectionModal(false)}>
        <CModalHeader onClose={() => setShowEditSubsectionModal(false)}>
          Editar Subseção
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="editSubsectionTitle">Título da Subseção</CFormLabel>
            <CFormInput
              type="text"
              id="editSubsectionTitle"
              value={editSubsectionTitle}
              onChange={(e) => setEditSubsectionTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editSubsectionDisplayOrder">Ordem de Exibição</CFormLabel>
            <CFormInput
              type="number"
              id="editSubsectionDisplayOrder"
              value={editSubsectionDisplayOrder}
              onChange={(e) => setEditSubsectionDisplayOrder(e.target.value)}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditSubsectionModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateSubsection}>
            Atualizar Subseção
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Element Modal */}
      <CModal visible={showEditElementModal} onClose={() => setShowEditElementModal(false)}>
        <CModalHeader onClose={() => setShowEditElementModal(false)}>
          Editar Opção Dinâmica
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="editElementType">Tipo de Elemento</CFormLabel>
            <CFormSelect
              id="editElementType"
              value={editElementType}
              onChange={(e) => setEditElementType(e.target.value)}
            >
              <option value="button">Botão</option>
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editElementLabel">Rótulo (Texto do Botão/Opção)</CFormLabel>
            <CFormInput
              type="text"
              id="editElementLabel"
              value={editElementLabel}
              onChange={(e) => setEditElementLabel(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editElementSourceActionId">ID da Ação (Único)</CFormLabel>
            <CFormInput
              type="text"
              id="editElementSourceActionId"
              value={editElementSourceActionId}
              onChange={(e) => setEditElementSourceActionId(e.target.value)}
              disabled
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editElementActionTextActivate">Texto ao Ativar</CFormLabel>
            <CFormTextarea
              id="editElementActionTextActivate"
              value={editElementActionTextActivate}
              onChange={(e) => setEditElementActionTextActivate(e.target.value)}
              rows="3"
            ></CFormTextarea>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="editElementActionTextDeactivate">Texto ao Desativar (Opcional)</CFormLabel>
            <CFormTextarea
              id="editElementActionTextDeactivate"
              value={editElementActionTextDeactivate}
              onChange={(e) => setEditElementActionTextDeactivate(e.target.value)}
              rows="3"
            ></CFormTextarea>
          </div>
          <div className="mb-3">
            <CFormCheck
              id="editElementIsDefaultSelected"
              label="Autoselecionar?"
              checked={editElementIsDefaultSelected}
              onChange={(e) => setEditElementIsDefaultSelected(e.target.checked)}
            />
          </div>
          {editElementType !== 'button' && (
            <div className="mb-3">
              <CFormLabel htmlFor="editElementDefaultValue">Valor Padrão (Opcional)</CFormLabel>
              <CFormInput
                type="text"
                id="editElementDefaultValue"
                value={editElementDefaultValue}
                onChange={(e) => setEditElementDefaultValue(e.target.value)}
              />
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditElementModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateElement}>
            Atualizar Opção
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para Adicionar Categoria */}
      <CModal visible={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)}>
        <CModalHeader onClose={() => setShowAddCategoryModal(false)}>
          Criar Nova Categoria de Laudo
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="newCategoryName">Nome da Categoria</CFormLabel>
            <CFormInput
              type="text"
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Ultrassom, Raio-X, Ressonância"
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddCategoryModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreateCategory}>
            Criar Categoria
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para Confirmar Exclusão de Categoria */}
      <CModal visible={showDeleteCategoryModal} onClose={() => setShowDeleteCategoryModal(false)}>
        <CModalHeader onClose={() => setShowDeleteCategoryModal(false)}>
          Confirmar Exclusão de Categoria
        </CModalHeader>
        <CModalBody>
          <p>Tem certeza que deseja excluir a categoria selecionada?</p>
          <p className="text-danger">Esta ação não pode ser desfeita e modelos de laudo associados a esta categoria ficarão sem categoria.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteCategoryModal(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteCategory}>
            Excluir Categoria
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default TemplateEditor;
